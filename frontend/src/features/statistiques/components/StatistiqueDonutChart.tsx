"use client";

import { Cell, Legend, Pie, PieChart, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { useMesureConteneur } from "../hooks/useMesureConteneur";
import { formatNombre } from "../utils/format";
import {
  COULEURS_DONUT,
  couleurCSS,
  styleInfoBulle,
} from "../utils/graphiques";

export interface PointDonut {
  nom: string;
  valeur: number;
}

interface StatistiqueDonutChartProps {
  data: PointDonut[];
  hauteur?: number;
  className?: string;
  formatValeur?: (valeur: number) => string;
}

export function StatistiqueDonutChart({
  data,
  hauteur = 240,
  className,
  formatValeur = (valeur) => formatNombre(valeur),
}: StatistiqueDonutChartProps) {
  const donnees = data.filter((point) => point.valeur > 0);
  const texte = couleurCSS("--muted-foreground", "#64748b");
  const carte = couleurCSS("--card", "#ffffff");
  const { ref, largeur, hauteur: hauteurMesuree } =
    useMesureConteneur<HTMLDivElement>(hauteur);

  if (donnees.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Aucune donnée sur la période.
      </p>
    );
  }

  return (
    <div ref={ref} className={cn("w-full", className)}>
      {largeur > 0 ? (
        <PieChart width={largeur} height={hauteurMesuree}>
          <Pie
            data={donnees}
            dataKey="valeur"
            nameKey="nom"
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
            stroke={carte}
            strokeWidth={2}
          >
            {donnees.map((point, index) => (
              <Cell
                key={point.nom}
                fill={COULEURS_DONUT[index % COULEURS_DONUT.length]}
              />
            ))}
          </Pie>
          <Tooltip
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
        </PieChart>
      ) : (
        <div style={{ height: hauteurMesuree }} />
      )}
    </div>
  );
}
