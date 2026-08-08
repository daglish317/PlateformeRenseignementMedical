"use client";
import { Badge } from "@/components/ui/badge";
import { PrioriteAlerte } from "../types/alerte";

const VARIANTES: Record<
  PrioriteAlerte,
  "secondary" | "warning" | "destructive"
> = {
  CRITIQUE: "destructive",
  MOYENNE: "warning",
  INFORMATION: "secondary",
};

const LIBELLES: Record<PrioriteAlerte, string> = {
  CRITIQUE: "Critique",
  MOYENNE: "Moyenne",
  INFORMATION: "Information",
};

interface AlertePrioriteBadgeProps {
  priorite: PrioriteAlerte;
}

export function AlertePrioriteBadge({ priorite }: AlertePrioriteBadgeProps) {
  return (
    <Badge variant={VARIANTES[priorite] ?? "secondary"}>
      {LIBELLES[priorite] ?? priorite}
    </Badge>
  );
}
