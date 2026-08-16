"use client";

import { useMemo } from "react";
import { Plus, Stethoscope, FlaskConical, HeartPulse, Package } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { SectionCard } from "../../dashboard/components/SectionCard";
import { useMyPermissions } from "@/features/shared/dashboard/hooks/useMyPermissions";
import { useMyStructureId } from "@/features/shared/dashboard/hooks/useMyStructureId";
import { hasModuleAction } from "@/features/shared/dashboard/utils/permissions";
import type { StructureType } from "../types/dashboard-home";

interface QuickActionsProps {
  type: StructureType;
}

interface ActionItem {
  label: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  module?: "STOCK" | "APPROVISIONNEMENT" | "VENTE";
  action?: "CONSULTER" | "CREER" | "MODIFIER";
}

const hospitalActions: ActionItem[] = [
  {
    label: "Ajouter un service",
    description: "Créer un nouveau service clinique ou administratif.",
    href: "/hospital/services",
    icon: Stethoscope,
  },
  {
    label: "Ajouter une analyse",
    description: "Déclarer un examen, une prestation ou un acte.",
    href: "/hospital/analyses",
    icon: FlaskConical,
  },
  {
    label: "Ajouter une prise en charge",
    description: "Enregistrer un parcours de prise en charge.",
    href: "/hospital/care-services",
    icon: HeartPulse,
  },
];

const pharmacyActions: ActionItem[] = [
  {
    label: "Ajouter un médicament",
    description: "Créer une fiche produit et l’ajouter au stock.",
    href: "/pharmacy/stock",
    icon: Package,
    module: "STOCK",
    action: "CREER",
  },
  {
    label: "Mettre à jour un stock",
    description: "Corriger les quantités ou un seuil d’alerte.",
    href: "/pharmacy/stock",
    icon: Plus,
    module: "STOCK",
    action: "MODIFIER",
  },
  {
    label: "Créer un approvisionnement",
    description: "Recevoir un lot et mettre à jour les entrées.",
    href: "/pharmacy/supply",
    icon: Plus,
    module: "APPROVISIONNEMENT",
    action: "CREER",
  },
];

export function QuickActions({ type }: QuickActionsProps) {
  const actions = type === "HOPITAL" ? hospitalActions : pharmacyActions;
  const { data: structureId } = useMyStructureId(type === "PHARMACIE");
  const { data: permissions } = useMyPermissions(
    structureId,
    type === "PHARMACIE" && Boolean(structureId)
  );

  const visibleActions = useMemo(() => {
    if (type !== "PHARMACIE") {
      return actions;
    }

    return actions.filter((action) => {
      if (!action.module) {
        return true;
      }

      return hasModuleAction(
        permissions?.modules,
        action.module,
        action.action ?? "CONSULTER"
      );
    });
  }, [actions, permissions?.modules, type]);

  return (
    <SectionCard title="Actions rapides">
      {visibleActions.length === 0 ? (
        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          Aucune action rapide n’est disponible avec les modules activés.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                prefetch={false}
                className="group flex h-full flex-col gap-4 rounded-lg border border-border/70 bg-background p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/40 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="rounded-full border bg-background px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Ouvrir
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{action.label}</p>
                  <p className="text-xs leading-5 text-muted-foreground">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
