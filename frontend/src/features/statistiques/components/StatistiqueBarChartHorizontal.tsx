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
import { formatNombre } from "../utils/format";
import { couleurCSS, styleInfoBulle } from "../utils/graphiques";

export interface PointBarre {
  nom: string;
  valeur: number;
}

interface StatistiqueBarChartHorizontalProps {
  data: PointBarre[];
  color?: string;
  hauteur?: number;
  className?: string;
  formatValeur?: (valeur: number) => string;
}

function tronquer(nom: string, limite = 22): string {
  return nom.length > limite ? `${nom.slice(0, limite - 1)}…` : nom;
}

export function StatistiqueBarChartHorizontal({
  data,
  color = "#10b981",
  hauteur = 240,
  className,
  formatValeur = (valeur) => formatNombre(valeur),
}: StatistiqueBarChartHorizontalProps) {
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
          layout="vertical"
          margin={{ top: 4, right: 40, left: 0, bottom: 4 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke={bordure}
          />
          <XAxis
            type="number"
            tickFormatter={(valeur: number) => formatNombre(valeur)}
            tick={{ fontSize: 11, fill: texte }}
            axisLine={{ stroke: bordure }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="nom"
            width={140}
            tickFormatter={(valeur: string) => tronquer(valeur)}
            tick={{ fontSize: 11, fill: texte }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <Tooltip
            cursor={{ fill: couleurCSS("--accent", "#e0e7ff") }}
            formatter={(valeur, nom) => [
              formatValeur(Number(valeur)),
              String(nom),
            ]}
            contentStyle={styleInfoBulle()}
          />
          <Bar
            dataKey="valeur"
            name="Valeur"
            fill={color}
            radius={[0, 4, 4, 0]}
            maxBarSize={24}
            label={{
              position: "right",
              fontSize: 10,
              fill: texte,
              formatter: (valeur: unknown) => formatNombre(Number(valeur)),
            }}
          />
        </BarChart>
      ) : (
        <div style={{ height: hauteurMesuree }} />
      )}
    </div>
  );
}
