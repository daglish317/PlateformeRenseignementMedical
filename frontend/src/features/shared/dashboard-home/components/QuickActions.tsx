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
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  module?: "STOCK" | "APPROVISIONNEMENT" | "VENTE";
  action?: "CONSULTER" | "CREER" | "MODIFIER";
}

const hospitalActions: ActionItem[] = [
  {
    label: "Ajouter un service",
    href: "/hospital/services",
    icon: Stethoscope,
  },
  {
    label: "Ajouter une analyse",
    href: "/hospital/analyses",
    icon: FlaskConical,
  },
  {
    label: "Ajouter une prise en charge",
    href: "/hospital/care-services",
    icon: HeartPulse,
  },
];

const pharmacyActions: ActionItem[] = [
  {
    label: "Ajouter un médicament",
    href: "/pharmacy/stock",
    icon: Package,
    module: "STOCK",
    action: "CREER",
  },
  {
    label: "Mettre à jour un stock",
    href: "/pharmacy/stock",
    icon: Plus,
    module: "STOCK",
    action: "MODIFIER",
  },
  {
    label: "Créer un approvisionnement",
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
          Aucune action rapide n&apos;est disponible avec les modules activés.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {visibleActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                prefetch={false}
                className="flex items-center gap-3 rounded-lg border p-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                {action.label}
              </Link>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
