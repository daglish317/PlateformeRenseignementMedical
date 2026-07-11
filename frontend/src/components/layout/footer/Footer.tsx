"use client";

import Logo from "@/components/layout/Logo";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-6 py-10">

        {/* Logo */}
        <Logo
          variant="horizontal"
          width={180}
          priority={false}
        />

        {/* Navigation */}
        <nav
          aria-label="Navigation du pied de page"
          className="flex flex-col items-center gap-4 text-sm font-medium text-muted-foreground sm:flex-row sm:gap-8"
        >
          <Link
            href="/about"
            className="transition-colors hover:text-primary"
          >
            À propos
          </Link>

          <Link
            href="/contact"
            className="transition-colors hover:text-primary"
          >
            Me contacter
          </Link>

          <Link
            href="/feedback"
            className="transition-colors hover:text-primary"
          >
            Laisser un avis
          </Link>
        </nav>

        {/* Copyright */}
        <p className="text-center text-sm text-muted-foreground">
          © {year} SantéProx · Tous droits réservés.
        </p>

      </div>
    </footer>
  );
}