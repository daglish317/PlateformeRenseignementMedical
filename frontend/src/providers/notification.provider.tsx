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
  const { lastMessage } = useWebSocket();
  const queryClient = useQueryClient();
  const authenticated = useAuthStore((s) => s.authenticated);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [unreadByNavItem, setUnreadByNavItem] = useState<Record<string, number>>({});

  const fetchUnreadCounts = useCallback(async () => {
    if (!authenticated) return;
    try {
      const counts = await notificationsService.unreadCounts();
      setUnreadByNavItem(counts);
    } catch {
      // silently fail
    }
  }, [authenticated]);

  useEffect(() => {
    fetchUnreadCounts();
  }, [fetchUnreadCounts]);

  useEffect(() => {
    if (!lastMessage) return;

    setNotifications((prev) => [lastMessage, ...prev].slice(0, 50));

    if (lastMessage.nav_item) {
      setUnreadByNavItem((prev) => ({
        ...prev,
        [lastMessage.nav_item!]: (prev[lastMessage.nav_item!] || 0) + 1,
        total: (prev.total || 0) + 1,
      }));
    } else {
      setUnreadByNavItem((prev) => ({
        ...prev,
        total: (prev.total || 0) + 1,
      }));
    }

    toast.info(lastMessage.titre, {
      description: lastMessage.message,
      duration: 5000,
    });

    queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "structures"] });
  }, [lastMessage, queryClient]);

  const markAllRead = useCallback(() => {
    const allIds = new Set(notifications.map((n) => n.id));
    setReadIds(allIds);
    fetchUnreadCounts();
  }, [notifications, fetchUnreadCounts]);

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
