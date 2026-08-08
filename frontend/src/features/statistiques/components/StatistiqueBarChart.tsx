"use client";

import { cn } from "@/lib/utils";
import { PointSerie } from "../types/statistiques";

interface StatistiqueBarChartProps {
  data: PointSerie[];
  color?: string;
  hauteur?: string;
  className?: string;
}

export function StatistiqueBarChart({
  data,
  color = "bg-primary",
  hauteur = "h-40",
  className,
}: StatistiqueBarChartProps) {
  const max = Math.max(...data.map((point) => point.valeur), 1);

  return (
    <div
      className={cn(
        "flex items-end gap-1 sm:gap-1.5 overflow-x-auto pb-1",
        hauteur,
        className
      )}
    >
      {data.map((point) => {
        const hauteurBarre =
          point.valeur > 0 ? Math.max((point.valeur / max) * 100, 3) : 0;
        return (
          <div
            key={point.periode}
            className="group flex min-w-[22px] flex-1 flex-col items-center gap-1"
            title={`${point.periode} : ${point.valeur}`}
          >
            <span className="text-[10px] font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
              {point.valeur}
            </span>
            <div
              className={cn("w-full rounded-t", color)}
              style={{ height: `${hauteurBarre}%` }}
            />
            <span className="text-[10px] text-muted-foreground">
              {point.periode}
            </span>
          </div>
        );
      })}
    </div>
  );
}
