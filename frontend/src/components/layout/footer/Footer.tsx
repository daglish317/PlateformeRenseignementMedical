"use client";

import { Link } from "@/i18n/navigation";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="shrink-0 border-t border-border bg-background/95">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <nav
          aria-label="Navigation du pied de page"
          className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground md:justify-start"
        >
          <Link href="/about" className="transition-colors hover:text-primary">
            A propos
          </Link>
          <Link href="/contact" className="transition-colors hover:text-primary">
            Me contacter
          </Link>
          <Link href="/feedback" className="transition-colors hover:text-primary">
            Laisser un avis
          </Link>
        </nav>

        <p className="text-center text-xs text-muted-foreground md:text-right">
          © {year} SanteProx. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
