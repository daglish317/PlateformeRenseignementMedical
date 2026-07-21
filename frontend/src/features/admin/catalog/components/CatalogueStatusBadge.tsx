"use client";

import { Badge } from "@/components/ui/badge";

export function CatalogueStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? "success" : "secondary"}>
      {isActive ? "Actif" : "Inactif"}
    </Badge>
  );
}
