"use client";

import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "../../dashboard/components/SectionCard";
import type { StructureType } from "../types/dashboard-home";

interface WelcomeCardProps {
  structureName: string;
  structureType: StructureType;
  statut: "EN_ATTENTE" | "ACTIVE" | "REFUSEE";
}

const statutConfig: Record<
  string,
  { label: string; variant: "warning" | "success" | "destructive" }
> = {
  EN_ATTENTE: { label: "En attente", variant: "warning" },
  ACTIVE: { label: "Active", variant: "success" },
  REFUSEE: { label: "Refusée", variant: "destructive" },
};

export function WelcomeCard({
  structureName,
  structureType,
  statut,
}: WelcomeCardProps) {
  const badge = statutConfig[statut];

  return (
    <SectionCard>
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold tracking-tight">
            Bienvenue, {structureName}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{structureType}</Badge>
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
