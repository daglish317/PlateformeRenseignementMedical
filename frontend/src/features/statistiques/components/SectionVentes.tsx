"use client";

import { useAnalyseVentes } from "../hooks/useStatistiques";
import { StatistiquesParams } from "../types/statistiques";
import { formatNombre } from "../utils/format";
import { StatistiqueBarChart } from "./StatistiqueBarChart";
import { StatistiqueCards } from "./StatistiqueCards";
import { StatistiquesSkeleton } from "./StatistiquesSkeleton";
import { SectionErreur } from "./SectionErreur";

interface SectionVentesProps {
  structureId: string;
  params: StatistiquesParams;
}

export function SectionVentes({
  structureId,
  params,
}: SectionVentesProps) {
  const { data, isLoading, error, refetch } = useAnalyseVentes(
    structureId,
    params
  );

  if (isLoading) return <StatistiquesSkeleton />;
  if (error || !data) return <SectionErreur onReessayer={() => refetch()} />;

  const meilleures = data.meilleures_periodes
    .map((p) => `${p.periode} (${p.valeur})`)
    .join(", ");

  return (
    <div className="space-y-6">
      <StatistiqueCards
        cartes={[
          {
            titre: "Ventes validées",
            valeur: formatNombre(data.nb_ventes),
            variation: data.evolution_ventes,
          },
          {
            titre: "Produits vendus",
            valeur: formatNombre(data.nb_produits_vendus),
            variation: data.evolution_produits,
          },
          {
            titre: "Meilleures périodes",
            valeur: formatNombre(data.meilleures_periodes.length),
            detail: meilleures || "Aucune donnée",
          },
          {
            titre: "Périodes les plus faibles",
            valeur: formatNombre(data.plus_faibles_periodes.length),
            detail:
              data.plus_faibles_periodes
                .map((p) => `${p.periode} (${p.valeur})`)
                .join(", ") || "Aucune donnée",
          },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <h4 className="mb-4 text-sm font-semibold">Évolution des ventes</h4>
          <StatistiqueBarChart data={data.series_ventes} color="bg-primary" />
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h4 className="mb-4 text-sm font-semibold">
            Évolution des produits vendus
          </h4>
          <StatistiqueBarChart
            data={data.series_produits}
            color="bg-cyan-500"
          />
        </div>
      </div>
    </div>
  );
}
