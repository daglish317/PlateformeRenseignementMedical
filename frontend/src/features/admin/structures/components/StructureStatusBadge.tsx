"use client";

import { Badge } from "@/components/ui/badge";
import type { StructureStatut } from "../types/structure";

const statutConfig: Record<StructureStatut, { label: string; variant: "warning" | "success" | "destructive" }> = {
  EN_ATTENTE: { label: "En attente", variant: "warning" },
  ACTIVE: { label: "Active", variant: "success" },
  REFUSEE: { label: "Refusée", variant: "destructive" },
};

export function StructureStatusBadge({ statut }: { statut: StructureStatut }) {
  const config = statutConfig[statut];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
