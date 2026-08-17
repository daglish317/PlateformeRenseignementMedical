"use client";

import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SectionCard } from "../../dashboard/components/SectionCard";
import type { StructureInfo } from "../types/dashboard-home";

interface StatusCardProps {
  structure: StructureInfo;
}

const statutConfig: Record<
  StructureInfo["statut"],
  {
    label: string;
    variant: "warning" | "success" | "destructive" | "outline";
    icon: React.ComponentType<{ className?: string }>;
    className?: string;
  }
> = {
  EN_ATTENTE: { label: "En attente de validation", variant: "warning", icon: Clock },
  ACTIVE: { label: "Validée", variant: "success", icon: CheckCircle },
  SUSPENDUE: {
    label: "Suspendue",
    variant: "outline",
    icon: AlertCircle,
    className: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
  },
  REFUSEE: { label: "Refusée", variant: "destructive", icon: XCircle },
};

export function StatusCard({ structure }: StatusCardProps) {
  const config = statutConfig[structure.statut];
  const Icon = config.icon;
  const dateToUse = structure.date_validation ?? structure.date_creation;
  const isHospital = structure.type === "HOPITAL";

  return (
    <SectionCard title="Statut de la structure">
      <div className="space-y-4">
        <div className="rounded-lg border border-border/70 bg-background p-4">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                structure.statut === "ACTIVE"
                  ? "bg-emerald-100 dark:bg-emerald-900/30"
                  : structure.statut === "REFUSEE"
                    ? "bg-red-100 dark:bg-red-900/30"
                    : structure.statut === "SUSPENDUE"
                      ? "bg-amber-100 dark:bg-amber-900/30"
                      : "bg-amber-100 dark:bg-amber-900/30"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  structure.statut === "ACTIVE"
                    ? "text-emerald-600 dark:text-emerald-300"
                    : structure.statut === "REFUSEE"
                      ? "text-red-600 dark:text-red-300"
                      : structure.statut === "SUSPENDUE"
                        ? "text-amber-600 dark:text-amber-300"
                        : "text-amber-600 dark:text-amber-300"
                }`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={config.variant} className={config.className}>
                  {config.label}
                </Badge>
                <Badge variant="outline">{isHospital ? "Hôpital" : "Pharmacie"}</Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {isHospital
                  ? "Les services hospitaliers dépendent du statut et des modules actifs."
                  : "Les modules visibles et les opérations disponibles dépendent des droits activés."}
              </p>
            </div>
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

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border bg-background p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Type de structure
            </p>
            <p className="mt-1 text-sm font-medium">
              {isHospital ? "Structure hospitalière" : "Pharmacie"}
            </p>
          </div>
          <div className="rounded-lg border bg-background p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Dernière mise à jour
            </p>
            <p className="mt-1 text-sm font-medium">
              {formatDistanceToNow(new Date(dateToUse), {
                addSuffix: false,
                locale: fr,
              })}
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
