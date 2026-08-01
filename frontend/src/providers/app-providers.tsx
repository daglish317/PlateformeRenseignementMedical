"use client";

import AuthProvider from "./auth.provider";
import NotificationProvider from "./notification.provider";
import WebSocketProvider from "./websocket.provider";
import LocaleProvider from "./locale.provider";
import ThemeProvider from "./theme.provider";
import QueryProvider from "./query.provider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";

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
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const providers = (
    <QueryProvider>
      <AuthProvider>
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
      </AuthProvider>
    </QueryProvider>
  );

  return (
    <LocaleProvider locale={locale} messages={messages}>
      <ThemeProvider>
        <GoogleOAuthProvider clientId={googleClientId ?? ""}>
          {providers}
        </GoogleOAuthProvider>
      </ThemeProvider>
    </LocaleProvider>
  );
}
console.log(
  "NEXT_PUBLIC_GOOGLE_CLIENT_ID =",
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
);