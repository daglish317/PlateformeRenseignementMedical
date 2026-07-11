import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/footer/Footer";

type PublicLayoutProps = {
  children: React.ReactNode;
};

export default function PublicLayout({
  children,
}: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
}