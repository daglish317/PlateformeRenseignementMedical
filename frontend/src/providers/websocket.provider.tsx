"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { authStorage } from "@/features/auth/utils/auth-storage";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { tokenService } from "@/features/auth/api/token.service";

interface WebSocketContextValue {
  connected: boolean;
  subscribe: (listener: (message: NotificationMessage) => void) => () => void;
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
  subscribe: () => () => {},
});

function decodeJwtPayload(token: string): { exp?: number } | null {
  const payloadPart = token.split(".")[1];
  if (!payloadPart) return null;

  try {
    const normalized = payloadPart
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payloadPart.length / 4) * 4, "=");
    const parsed = JSON.parse(atob(normalized));
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as { exp?: number };
  } catch {
    return null;
  }
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}

export default function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const reconnectAttemptsRef = useRef(0);
  const mountedRef = useRef(true);
  const intentionalCloseRef = useRef(false);
  const listenersRef = useRef(new Set<(message: NotificationMessage) => void>());
  const connectRef = useRef<() => Promise<void>>(async () => {});
  const authenticated = useAuthStore((s) => s.authenticated);
  const hydrated = useAuthStore((s) => s.hydrated);

  const scheduleReconnect = useCallback(() => {
    if (!mountedRef.current) return;
    // Backoff exponentiel (5s, 10s, 20s...) plafonné à 60s avec un peu de jitter
    // pour éviter un rafraîchissement continu du serveur.
    const tentatives = reconnectAttemptsRef.current;
    const delai = Math.min(5000 * 2 ** tentatives, 60000) + Math.random() * 2000;
    reconnectTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) connectRef.current();
    }, delai);
  }, []);

  const subscribe = useCallback((listener: (message: NotificationMessage) => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const connect = useCallback(async () => {
    if (!authenticated || !hydrated || !mountedRef.current) return;

    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    // refresh token if expired before connecting
    let token = authStorage.getAccessToken();
    if (token) {
      const payload = decodeJwtPayload(token);
      if (payload?.exp) {
        const isExpired = payload.exp * 1000 < Date.now();
        if (isExpired) {
          const tokens = await tokenService.refreshToken();
          useAuthStore.getState().setTokens(tokens);
          token = tokens.access;
        }
      }
    }
    if (!token) return;

    intentionalCloseRef.current = false;

    const wsUrl = process.env.NEXT_PUBLIC_API_URL?.replace("http", "ws").replace("/api", "")
      || "ws://localhost:8000";

    const ws = new WebSocket(`${wsUrl}/ws/notifications/?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttemptsRef.current = 0;
      if (mountedRef.current) setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data: NotificationMessage = JSON.parse(event.data);
        listenersRef.current.forEach((listener) => listener(data));
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => {
      setConnected(false);
      if (intentionalCloseRef.current || !mountedRef.current) return;
      if (authenticated && mountedRef.current) {
        reconnectAttemptsRef.current += 1;
        scheduleReconnect();
      }
    };

    ws.onerror = () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [authenticated, hydrated, scheduleReconnect]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

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
    }

    return () => {
      mountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      safeClose();
    };
  }, [authenticated, connect, safeClose]);

  return (
    <WebSocketContext.Provider value={{ connected, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
}
