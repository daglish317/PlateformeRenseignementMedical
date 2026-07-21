"use client";

import {
  Stethoscope,
  FlaskConical,
  Monitor,
  HeartPulse,
  Package,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import type { StructureType } from "../types/dashboard-home";

interface StatItem {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface StatisticsCardsProps {
  stats: Record<string, number | undefined>;
  type: StructureType;
}

const hospitalStats = (s: Record<string, number | undefined>): StatItem[] => [
  {
    label: "Services",
    value: s.services_count ?? 0,
    icon: Stethoscope,
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300",
  },
  {
    label: "Analyses",
    value: s.analyses_count ?? 0,
    icon: FlaskConical,
    color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300",
  },
  {
    label: "Plateaux techniques",
    value: s.technical_platforms_count ?? 0,
    icon: Monitor,
    color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-300",
  },
  {
    label: "Prises en charge",
    value: s.care_services_count ?? 0,
    icon: HeartPulse,
    color: "text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300",
  },
];

const pharmacyStats = (s: Record<string, number | undefined>): StatItem[] => [
  {
    label: "Articles en stock",
    value: s.stock_items_count ?? 0,
    icon: Package,
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300",
  },
  {
    label: "Disponibles",
    value: s.available_items ?? 0,
    icon: CheckCircle,
    color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  {
    label: "Stock faible",
    value: s.low_stock_items ?? 0,
    icon: AlertTriangle,
    color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300",
  },
  {
    label: "Rupture de stock",
    value: s.out_of_stock_items ?? 0,
    icon: XCircle,
    color: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300",
  },
];

export function StatisticsCards({ stats, type }: StatisticsCardsProps) {
  const items = type === "HOPITAL" ? hospitalStats(stats) : pharmacyStats(stats);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="flex items-center gap-4 rounded-xl border bg-card p-4"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.color}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
