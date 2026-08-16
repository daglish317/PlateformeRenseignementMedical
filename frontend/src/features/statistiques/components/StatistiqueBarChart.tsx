"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { useMesureConteneur } from "../hooks/useMesureConteneur";
import { PointSerie } from "../types/statistiques";
import { formatNombre } from "../utils/format";
import {
  COULEURS_NAVIGATION,
  couleurCSS,
  styleInfoBulle,
} from "../utils/graphiques";

interface StatistiqueBarChartProps {
  data: PointSerie[];
  color?: string;
  hauteur?: number;
  className?: string;
  formatValeur?: (valeur: number) => string;
  formatPeriode?: (periode: string) => string;
}

export function StatistiqueBarChart({
  data,
  color = "bg-primary",
  hauteur = 240,
  className,
  formatValeur = (valeur) => formatNombre(valeur),
  formatPeriode = (periode) => periode,
}: StatistiqueBarChartProps) {
  const couleurRemplissage = COULEURS_NAVIGATION[color] ?? color;
  const texte = couleurCSS("--muted-foreground", "#64748b");
  const bordure = couleurCSS("--border", "#e2e8f0");
  const { ref, largeur, hauteur: hauteurMesuree } =
    useMesureConteneur<HTMLDivElement>(hauteur);

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Aucune donnée sur la période.
      </p>
    );
  }

  return (
    <div ref={ref} className={cn("w-full", className)}>
      {largeur > 0 ? (
        <BarChart
          width={largeur}
          height={hauteurMesuree}
          data={data}
          margin={{ top: 16, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={bordure}
          />
          <XAxis
            dataKey="periode"
            tickFormatter={(valeur: string) => formatPeriode(valeur)}
            tick={{ fontSize: 11, fill: texte }}
            interval="preserveStartEnd"
            minTickGap={8}
            axisLine={{ stroke: bordure }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(valeur: number) => formatNombre(valeur)}
            tick={{ fontSize: 11, fill: texte }}
            width={52}
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: couleurCSS("--accent", "#e0e7ff") }}
            formatter={(valeur) => formatValeur(Number(valeur))}
            labelFormatter={(periode) => formatPeriode(String(periode))}
            contentStyle={styleInfoBulle()}
          />
          <Bar
            dataKey="valeur"
            name="Valeur"
            fill={couleurRemplissage}
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
            {...(data.length <= 12
              ? {
                  label: {
                    position: "top",
                    fontSize: 10,
                    fill: texte,
                    formatter: (valeur: unknown) =>
                      formatNombre(Number(valeur)),
                  },
                }
              : {})}
          />
        </BarChart>
      ) : (
        <div style={{ height: hauteurMesuree }} />
      )}
    </div>
  );
}
