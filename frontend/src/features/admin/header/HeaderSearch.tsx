"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function HeaderSearch() {
  return (
    <div className="relative hidden max-w-sm flex-1 md:block">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Recherche globale..."
        className="pl-9"
        disabled
        aria-label="Recherche globale (bientôt disponible)"
      />
    </div>
  );
}
