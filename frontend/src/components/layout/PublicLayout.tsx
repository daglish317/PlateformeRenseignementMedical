"use client";

import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/footer/Footer";

type PublicLayoutProps = {
  children: React.ReactNode;
  showSearch?: boolean;
  showFooter?: boolean;
};

export default function PublicLayout({
  children,
  showSearch = true,
  showFooter = false,
}: PublicLayoutProps) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <Header showSearch={showSearch} />

      <main className="flex-1 min-h-0 overflow-auto">
        {children}
      </main>

      {showFooter && <Footer />}
    </div>
  );
}