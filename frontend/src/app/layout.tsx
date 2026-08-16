import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";

import { SerwistProvider } from "@serwist/next/react";

import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  title: "SanteProx",
  description: "Plateforme de recherche et de gestion des structures medicales",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SanteProx",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      {
        url: "/logo_mobile/Gemini_Generated_Image_loefffloefffloef.png",
        sizes: "any",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/logo_mobile/Gemini_Generated_Image_loefffloefffloef.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <SerwistProvider
          swUrl="/sw.js"
          register={process.env.NODE_ENV === "production"}
          cacheOnNavigation
          reloadOnOnline
          disable={process.env.NODE_ENV !== "production"}
        >
          {children}
        </SerwistProvider>
      </body>
    </html>
  );
}
