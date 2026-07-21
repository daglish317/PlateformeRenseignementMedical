"use client";

import { Badge } from "@/components/ui/badge";

export function UserStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? "success" : "destructive"}>
      {isActive ? "Actif" : "Suspendu"}
    </Badge>
  );
}
