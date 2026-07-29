"use client";

import { Badge } from "@/components/ui/badge";

export function ServiceStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? "success" : "secondary"}>
      {isActive ? "Actif" : "Inactif"}
    </Badge>
  );
}
