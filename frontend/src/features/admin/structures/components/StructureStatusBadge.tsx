"use client";

import { Badge } from "@/components/ui/badge";
import type { StructureStatut } from "../types/structure";

const statutConfig: Record<
  StructureStatut,
  { label: string; variant: "warning" | "success" | "destructive" | "outline"; className?: string }
> = {
  EN_ATTENTE: { label: "En attente", variant: "warning" },
  ACTIVE: { label: "Active", variant: "success" },
  SUSPENDUE: {
    label: "Suspendue",
    variant: "outline",
    className: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
  },
  REFUSEE: { label: "Refusée", variant: "destructive" },
};

export function StructureStatusBadge({ statut }: { statut: StructureStatut }) {
  const config = statutConfig[statut];
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
