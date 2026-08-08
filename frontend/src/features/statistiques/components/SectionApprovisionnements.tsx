"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApprovisionnements } from "../hooks/useStatistiques";
import { StatistiquesParams } from "../types/statistiques";
import { formatMontant, formatNombre } from "../utils/format";
import { StatistiqueBarChart } from "./StatistiqueBarChart";
import { StatistiqueCards } from "./StatistiqueCards";
import { StatistiquesSkeleton } from "./StatistiquesSkeleton";
import { SectionErreur } from "./SectionErreur";

interface SectionApprovisionnementsProps {
  structureId: string;
  params: StatistiquesParams;
}

export function SectionApprovisionnements({
  structureId,
  params,
}: SectionApprovisionnementsProps) {
  const { data, isLoading, error, refetch } = useApprovisionnements(
    structureId,
    params
  );

  if (isLoading) return <StatistiquesSkeleton />;
  if (error || !data)
    return <SectionErreur onReessayer={() => refetch()} />;

  return (
    <div className="space-y-6">
      <StatistiqueCards
        cartes={[
          {
            titre: "Approvisionnements",
            valeur: formatNombre(data.nombre),
            variation: data.evolution,
          },
          {
            titre: "Quantité totale reçue",
            valeur: formatNombre(data.quantite_totale),
          },
          {
            titre: "Montant des approvisionnements",
            valeur: formatMontant(data.montant_total),
          },
          {
            titre: "Périodes de forte réception",
            valeur: formatNombre(data.periodes_forte_reception.length),
            detail:
              data.periodes_forte_reception
                .map((p) => `${p.periode} (${p.valeur})`)
                .join(", ") || "Aucune donnée",
          },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <h4 className="mb-4 text-sm font-semibold">
            Nombre d&apos;approvisionnements
          </h4>
          <StatistiqueBarChart
            data={data.series_nombre}
            color="bg-emerald-500"
          />
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h4 className="mb-4 text-sm font-semibold">
            Quantités reçues par période
          </h4>
          <StatistiqueBarChart
            data={data.series_quantite}
            color="bg-teal-500"
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h4 className="mb-4 text-sm font-semibold">
          Produits fréquemment approvisionnés
        </h4>
        {data.produits_frequents.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            Aucun approvisionnement sur la période.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead className="text-right">
                  Approvisionnements
                </TableHead>
                <TableHead className="text-right">Quantité totale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.produits_frequents.map((produit) => (
                <TableRow key={produit.nom}>
                  <TableCell className="font-medium">{produit.nom}</TableCell>
                  <TableCell className="text-right">
                    {formatNombre(produit.nb_approvisionnements)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNombre(produit.quantite_totale)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
