import type { ReactNode } from "react";
import type { Metadata } from "next";

import "./globals.css";


export const metadata: Metadata = {
  title: "SantéProx",
  description:
    "Plateforme de recherche et de gestion des structures médicales",
};


type RootLayoutProps = {
  children: ReactNode;
};


export default function RootLayout({
  children,
}: RootLayoutProps) {

  return (
    <html
      suppressHydrationWarning
    >
      <body
        className="min-h-screen antialiased"
      >
        {children}
      </body>
    </html>
  );
}