"use client";

import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/footer/Footer";


type PublicLayoutProps = {
  children: React.ReactNode;
};


export default function PublicLayout({
  children,
}: PublicLayoutProps) {


  return (
    <div
      className="
        flex
        h-dvh
        flex-col
        overflow-hidden
        bg-background
      "
    >

      <Header />


      <main
        className="
          flex-1
          min-h-0
          overflow-hidden
        "
      >
        {children}
      </main>


      

    </div>
  );
}