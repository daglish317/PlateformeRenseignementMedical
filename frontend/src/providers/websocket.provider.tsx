"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { authStorage } from "@/features/auth/utils/auth-storage";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { tokenService } from "@/features/auth/api/token.service";

interface WebSocketContextValue {
  connected: boolean;
  lastMessage: NotificationMessage | null;
}

export interface NotificationMessage {
  id: string;
  titre: string;
  message: string;
  type: string;
  nav_item?: string;
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
  const mountedRef = useRef(true);
  const intentionalCloseRef = useRef(false);
  const authenticated = useAuthStore((s) => s.authenticated);
  const hydrated = useAuthStore((s) => s.hydrated);

  const connect = useCallback(async () => {
    if (!authenticated || !hydrated || !mountedRef.current) return;

    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    // refresh token if expired before connecting
    let token = authStorage.getAccessToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        if (isExpired) {
          const tokens = await tokenService.refreshToken();
          useAuthStore.getState().setTokens(tokens);
          token = tokens.access;
        }
      } catch {
        // if token parsing fails, use it as-is
      }
    }
    if (!token) return;

    intentionalCloseRef.current = false;

    const wsUrl = process.env.NEXT_PUBLIC_API_URL?.replace("http", "ws").replace("/api", "")
      || "ws://localhost:8000";

    const ws = new WebSocket(`${wsUrl}/ws/notifications/?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      if (mountedRef.current) setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data: NotificationMessage = JSON.parse(event.data);
        if (mountedRef.current) setLastMessage(data);
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => {
      if (intentionalCloseRef.current || !mountedRef.current) return;
      setConnected(false);
      if (authenticated && mountedRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) connect();
        }, 5000);
      }
    };

    ws.onerror = () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [authenticated, hydrated]);

  const safeClose = useCallback(() => {
    intentionalCloseRef.current = true;
    if (wsRef.current) {
      const state = wsRef.current.readyState;
      if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    if (authenticated) {
      connect();
    } else {
      safeClose();
      setConnected(false);
    }

    return () => {
      mountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      safeClose();
      setConnected(false);
    };
  }, [authenticated, connect, safeClose]);

  return (
    <WebSocketContext.Provider value={{ connected, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}
