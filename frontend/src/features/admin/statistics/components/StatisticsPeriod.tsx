"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStatisticsStore } from "../store/statistics-store";

const periods = [
  { value: "today", label: "Aujourd'hui" },
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
  { value: "12m", label: "12 mois" },
];

export function StatisticsPeriod() {
  const { period, setPeriod } = useStatisticsStore();

  return (
    <div className="flex flex-wrap gap-2">
      {periods.map((p) => (
        <Button
          key={p.value}
          variant={period === p.value ? "default" : "outline"}
          size="sm"
          className={cn(period === p.value && "bg-primary text-primary-foreground")}
          onClick={() => setPeriod(p.value)}
        >
          {p.label}
        </Button>
      ))}
    </div>
  );
}
