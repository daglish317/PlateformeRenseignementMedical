"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAnalyseStock } from "../hooks/useStatistiques";
import { StatistiquesParams } from "../types/statistiques";
import { formatMontant, formatNombre } from "../utils/format";
import { StatistiqueCards } from "./StatistiqueCards";
import { StatistiqueDonutChart } from "./StatistiqueDonutChart";
import { StatistiquesSkeleton } from "./StatistiquesSkeleton";
import { SectionErreur } from "./SectionErreur";

interface SectionStockProps {
  structureId: string;
  params: StatistiquesParams;
}

const LIBELLES_TYPE: Record<string, string> = {
  MEDICAMENT: "Médicaments",
  EQUIPEMENT: "Équipements",
  CONSOMMABLE: "Consommables",
};

export function SectionStock({
  structureId,
  params,
}: SectionStockProps) {
  const { data, isLoading, error, refetch } = useAnalyseStock(
    structureId,
    params
  );

  if (isLoading) return <StatistiquesSkeleton />;
  if (error || !data) return <SectionErreur onReessayer={() => refetch()} />;

  return (
    <div className="space-y-6">
      <StatistiqueCards
        cartes={[
          {
            titre: "Références",
            valeur: formatNombre(data.nb_references),
            detail: `${formatNombre(data.nb_disponibles)} disponibles`,
          },
          {
            titre: "Ruptures",
            valeur: formatNombre(data.nb_ruptures),
            variation: data.evolution_ruptures?.variation,
            detail: `Période précédente : ${formatNombre(
              data.evolution_ruptures?.precedent
            )}`,
            ton: data.nb_ruptures > 0 ? "destructive" : "success",
          },
          {
            titre: "Stocks sous le seuil",
            valeur: formatNombre(data.nb_stocks_faibles),
            ton: data.nb_stocks_faibles > 0 ? "warning" : "success",
          },
          {
            titre: "Valeur du stock (achat)",
            valeur: formatMontant(data.valeur.achat),
            detail: `Vente : ${formatMontant(data.valeur.vente)}`,
          },
        ]}
      />

      <div className="rounded-xl border bg-card p-4">
        <h4 className="mb-4 text-sm font-semibold">Répartition par type</h4>
        <StatistiqueDonutChart
          data={data.par_type.map((type) => ({
            nom: LIBELLES_TYPE[type.type] ?? type.type,
            valeur: type.nb_references,
          }))}
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Références</TableHead>
              <TableHead className="text-right">Disponibles</TableHead>
              <TableHead className="text-right">Ruptures</TableHead>
              <TableHead className="text-right">Sous le seuil</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.par_type.map((type) => (
              <TableRow key={type.type}>
                <TableCell className="font-medium">
                  {LIBELLES_TYPE[type.type] ?? type.type}
                </TableCell>
                <TableCell className="text-right">
                  {formatNombre(type.nb_references)}
                </TableCell>
                <TableCell className="text-right">
                  {formatNombre(type.nb_disponibles)}
                </TableCell>
                <TableCell className="text-right">
                  {type.nb_ruptures > 0 ? (
                    <Badge variant="destructive">
                      {formatNombre(type.nb_ruptures)}
                    </Badge>
                  ) : (
                    formatNombre(type.nb_ruptures)
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {formatNombre(type.nb_stocks_faibles)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h4 className="mb-4 text-sm font-semibold">
          Produits en rupture (30 derniers jours)
        </h4>
        {data.produits_ruptures.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            Aucune rupture signalée récemment.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead className="text-right">Ruptures</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.produits_ruptures.map((produit) => (
                <TableRow key={produit.nom}>
                  <TableCell className="font-medium">{produit.nom}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="destructive">
                      {formatNombre(produit.nb_ruptures)}
                    </Badge>
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
