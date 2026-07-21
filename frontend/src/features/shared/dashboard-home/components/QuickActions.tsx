"use client";

import { Plus, Stethoscope, FlaskConical, HeartPulse, Package } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SectionCard } from "../../dashboard/components/SectionCard";
import type { StructureType } from "../types/dashboard-home";

interface QuickActionsProps {
  type: StructureType;
}

interface ActionItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
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
  },
  {
    label: "Mettre à jour un stock",
    href: "/pharmacy/stock",
    icon: Plus,
  },
];

export function QuickActions({ type }: QuickActionsProps) {
  const actions = type === "HOPITAL" ? hospitalActions : pharmacyActions;

  return (
    <SectionCard title="Actions rapides">
      <div className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
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
    </SectionCard>
  );
}
