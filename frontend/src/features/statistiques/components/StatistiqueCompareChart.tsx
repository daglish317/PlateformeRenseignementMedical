"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { useMesureConteneur } from "../hooks/useMesureConteneur";
import { formatNombre } from "../utils/format";
import {
  couleurCSS,
  couleurPrincipale,
  styleInfoBulle,
} from "../utils/graphiques";

export interface PointComparaison {
  indicateur: string;
  actuel: number;
  precedent: number;
}

interface StatistiqueCompareChartProps {
  data: PointComparaison[];
  libelleActuel: string;
  libellePrecedent: string;
  hauteur?: number;
  className?: string;
  formatValeur?: (valeur: number) => string;
}

export function StatistiqueCompareChart({
  data,
  libelleActuel,
  libellePrecedent,
  hauteur = 260,
  className,
  formatValeur = (valeur) => formatNombre(valeur),
}: StatistiqueCompareChartProps) {
  const texte = couleurCSS("--muted-foreground", "#64748b");
  const bordure = couleurCSS("--border", "#e2e8f0");
  const couleurActuel = couleurPrincipale();
  const { ref, largeur, hauteur: hauteurMesuree } =
    useMesureConteneur<HTMLDivElement>(hauteur);

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Aucune donnée disponible pour la comparaison.
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
          barGap={4}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={bordure}
          />
          <XAxis
            dataKey="indicateur"
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
            formatter={(valeur, nom) => [
              formatValeur(Number(valeur)),
              String(nom),
            ]}
            contentStyle={styleInfoBulle()}
          />
          <Legend
            iconType="circle"
            iconSize={10}
            formatter={(valeur) => (
              <span style={{ color: texte, fontSize: 12 }}>{valeur}</span>
            )}
            wrapperStyle={{ fontSize: 12 }}
          />
          <Bar
            dataKey="actuel"
            name={libelleActuel}
            fill={couleurActuel}
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
          <Bar
            dataKey="precedent"
            name={libellePrecedent}
            fill="#94a3b8"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      ) : (
        <div style={{ height: hauteurMesuree }} />
      )}
    </div>
  );
}
