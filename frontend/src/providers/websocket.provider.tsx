"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { authStorage } from "@/features/auth/utils/auth-storage";
import { useAuthStore } from "@/features/auth/store/auth-store";

interface WebSocketContextValue {
  connected: boolean;
  lastMessage: NotificationMessage | null;
}

export interface NotificationMessage {
  id: string;
  titre: string;
  message: string;
  type: string;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  connected: false,
  lastMessage: null,
});

export function useWebSocket() {
  return useContext(WebSocketContext);
}

export default function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<NotificationMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const authenticated = useAuthStore((s) => s.authenticated);

  const connect = useCallback(() => {
    if (!authenticated) return;

    const token = authStorage.getAccessToken();
    if (!token) return;

    const wsUrl = process.env.NEXT_PUBLIC_API_URL?.replace("http", "ws").replace("/api", "")
      || "ws://localhost:8000";

    const ws = new WebSocket(`${wsUrl}/ws/notifications/?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data: NotificationMessage = JSON.parse(event.data);
        setLastMessage(data);
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => {
      setConnected(false);
      if (authenticated) {
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [authenticated]);

  useEffect(() => {
    if (authenticated) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      setConnected(false);
    };
  }, [authenticated, connect]);

  return (
    <WebSocketContext.Provider value={{ connected, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}
