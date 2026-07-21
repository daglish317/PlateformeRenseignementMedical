"use client";

import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "../../dashboard/components/SectionCard";
import type { StructureInfo } from "../types/dashboard-home";

interface StatusCardProps {
  structure: StructureInfo;
}

const statutConfig: Record<
  string,
  {
    label: string;
    variant: "warning" | "success" | "destructive";
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  EN_ATTENTE: { label: "En attente de validation", variant: "warning", icon: Clock },
  ACTIVE: { label: "Validée", variant: "success", icon: CheckCircle },
  REFUSEE: { label: "Refusée", variant: "destructive", icon: XCircle },
};

export function StatusCard({ structure }: StatusCardProps) {
  const config = statutConfig[structure.statut];
  const Icon = config.icon;
  const dateToUse = structure.date_validation ?? structure.date_creation;

  return (
    <SectionCard title="Statut de la structure">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              structure.statut === "ACTIVE"
                ? "bg-emerald-100 dark:bg-emerald-900/30"
                : structure.statut === "REFUSEE"
                  ? "bg-red-100 dark:bg-red-900/30"
                  : "bg-amber-100 dark:bg-amber-900/30"
            }`}
          >
            <Icon
              className={`h-5 w-5 ${
                structure.statut === "ACTIVE"
                  ? "text-emerald-600 dark:text-emerald-300"
                  : structure.statut === "REFUSEE"
                    ? "text-red-600 dark:text-red-300"
                    : "text-amber-600 dark:text-amber-300"
              }`}
            />
          </div>
          <div>
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>
        </div>

        {structure.motif_refus && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4" />
              Motif du refus
            </div>
            <p className="mt-1">{structure.motif_refus}</p>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          Dernière mise à jour il y a{" "}
          {formatDistanceToNow(new Date(dateToUse), {
            addSuffix: false,
            locale: fr,
          })}
        </div>
      </div>
    </SectionCard>
  );
}
