"use client";

import { Hospital, MapPin, Phone, Pill, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SectionCard } from "../../dashboard/components/SectionCard";
import type { StructureInfo } from "../types/dashboard-home";

interface WelcomeCardProps {
  structure: StructureInfo;
}

const statutConfig: Record<
  string,
  { label: string; variant: "warning" | "success" | "destructive" }
> = {
  EN_ATTENTE: { label: "En attente", variant: "warning" },
  ACTIVE: { label: "Active", variant: "success" },
  REFUSEE: { label: "Refusée", variant: "destructive" },
};

export function WelcomeCard({ structure }: WelcomeCardProps) {
  const badge = statutConfig[structure.statut];
  const isHospital = structure.type === "HOPITAL";
  const StructureIcon = isHospital ? Hospital : Pill;

  return (
    <SectionCard className="overflow-hidden border-border/70 bg-card p-0 shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[1.45fr_0.55fr]">
        <div className="p-5 md:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 shadow-sm">
              <StructureIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{isHospital ? "Hôpital" : "Pharmacie"}</Badge>
                <Badge variant={badge.variant}>{badge.label}</Badge>
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                {structure.nom}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {isHospital
                  ? "Vue synthétique de l’activité, des services et du statut de votre structure hospitalière."
                  : "Vue synthétique du stock, des opérations et des accès actifs de votre pharmacie."}
              </p>

              <div className="mt-5 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="truncate">{structure.adresse || "Adresse non renseignée"}</span>
                </div>
                <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="truncate">{structure.telephone || "Téléphone non renseigné"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t bg-[var(--dashboard-brand-panel)] p-5 lg:border-l lg:border-t-0 md:p-6">
          <div className="flex h-full flex-col justify-between gap-5">
            <div>
              <p className="text-sm font-medium text-muted-foreground">État opérationnel</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{badge.label}</p>
                  <p className="text-xs text-muted-foreground">
                    Données synchronisées avec la structure active.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              Les modules visibles dans cet espace dépendent des droits activés par le propriétaire.
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
