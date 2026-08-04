"use client";

import { Suspense, lazy } from "react";
import AuthProvider from "./auth.provider";
import NotificationProvider from "./notification.provider";
import LocaleProvider from "./locale.provider";
import ThemeProvider from "./theme.provider";
import QueryProvider from "./query.provider";
import { Toaster } from "sonner";

// Lazy load WebSocket provider (seulement pour utilisateurs authentifiés)
const WebSocketProvider = lazy(() => import("./websocket.provider"));

type AppProvidersProps = {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, unknown>;
};

export default function AppProviders({
  children,
  locale,
  messages,
}: AppProvidersProps) {
  const providers = (
    <QueryProvider>
      <AuthProvider>
        <Suspense fallback={null}>
          <WebSocketProvider>
            <NotificationProvider>
              {children}
              <Toaster
                position="top-right"
                richColors
                closeButton
                duration={3000}
              />
            </NotificationProvider>
          </WebSocketProvider>
        </Suspense>
      </AuthProvider>
    </QueryProvider>
  );

  return (
    <LocaleProvider locale={locale} messages={messages}>
      <ThemeProvider>
        {providers}
      </ThemeProvider>
    </LocaleProvider>
  );
}
