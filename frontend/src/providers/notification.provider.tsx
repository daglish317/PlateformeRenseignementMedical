"use client";

import { createContext, useContext, useEffect, useCallback, useState } from "react";
import { useWebSocket, NotificationMessage } from "./websocket.provider";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface NotificationContextValue {
  notifications: NotificationMessage[];
  unreadCount: number;
  markAllRead: () => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  markAllRead: () => {},
});

export function useNotifications() {
  return useContext(NotificationContext);
}

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { lastMessage, connected } = useWebSocket();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!lastMessage) return;

    setNotifications((prev) => [lastMessage, ...prev].slice(0, 50));

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
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}
