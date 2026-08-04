"use client";

import { createContext, useContext, useEffect, useCallback, useState, useMemo } from "react";
import { useWebSocket, NotificationMessage } from "./websocket.provider";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { notificationsService } from "@/features/admin/notifications/api/notifications.service";
import { toast } from "sonner";

interface NotificationContextValue {
  notifications: NotificationMessage[];
  unreadCount: number;
  unreadByNavItem: Record<string, number>;
  getUnreadCount: (navItem: string) => number;
  markAllRead: () => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  unreadByNavItem: {},
  getUnreadCount: () => 0,
  markAllRead: () => {},
});

export function useNotifications() {
  return useContext(NotificationContext);
}

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { subscribe } = useWebSocket();
  const queryClient = useQueryClient();
  const authenticated = useAuthStore((s) => s.authenticated);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [unreadByNavItem, setUnreadByNavItem] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!hydrated || !authenticated) return;
    notificationsService
      .unreadCounts()
      .then(setUnreadByNavItem)
      .catch(() => {
        // silently fail
      });
  }, [hydrated, authenticated]);

  useEffect(() => {
    return subscribe((message) => {
      setNotifications((prev) => [message, ...prev].slice(0, 50));

      if (message.nav_item) {
        setUnreadByNavItem((prev) => ({
          ...prev,
          [message.nav_item!]: (prev[message.nav_item!] || 0) + 1,
          total: (prev.total || 0) + 1,
        }));
      } else {
        setUnreadByNavItem((prev) => ({
          ...prev,
          total: (prev.total || 0) + 1,
        }));
      }

      toast.info(message.titre, {
        description: message.message,
        duration: 5000,
      });

      queryClient.invalidateQueries({
        queryKey: ["notifications"],
        refetchType: "inactive",
      });
      queryClient.invalidateQueries({
        queryKey: ["unread-counts"],
        refetchType: "inactive",
      });
    });
  }, [subscribe, queryClient]);

  const markAllRead = useCallback(async () => {
    try {
      await notificationsService.markAllAsRead();
    } catch {
      // silently fail
    }
    setUnreadByNavItem({});
    queryClient.invalidateQueries({
      queryKey: ["notifications"],
      refetchType: "inactive",
    });
    queryClient.invalidateQueries({
      queryKey: ["unread-counts"],
      refetchType: "inactive",
    });
  }, [queryClient]);

  const unreadCount = unreadByNavItem.total || 0;

  const getUnreadCount = useCallback(
    (navItem: string) => unreadByNavItem[navItem] || 0,
    [unreadByNavItem]
  );

  const value = useMemo(
    () => ({ notifications, unreadCount, unreadByNavItem, getUnreadCount, markAllRead }),
    [notifications, unreadCount, unreadByNavItem, getUnreadCount, markAllRead]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
