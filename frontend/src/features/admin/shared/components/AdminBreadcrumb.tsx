"use client";

import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useBreadcrumb } from "../hooks/useBreadcrumb";

export function AdminBreadcrumb() {
  const items = useBreadcrumb();

  if (items.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-1 text-sm text-muted-foreground">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={item.href} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}
            {isLast ? (
              <span className="font-medium text-foreground">{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:text-foreground transition-colors">
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
