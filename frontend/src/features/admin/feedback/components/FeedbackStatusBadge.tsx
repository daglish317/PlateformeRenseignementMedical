"use client";

import { Badge } from "@/components/ui/badge";
import type { FeedbackStatut } from "../types/feedback";

const statusConfig: Record<FeedbackStatut, { label: string; variant: "warning" | "secondary" | "success" }> = {
  NON_LU: { label: "Non lu", variant: "warning" },
  LU: { label: "Lu", variant: "secondary" },
  TRAITE: { label: "Traité", variant: "success" },
};

export function FeedbackStatusBadge({ statut }: { statut: FeedbackStatut }) {
  const config = statusConfig[statut];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
