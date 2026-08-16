"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useComparaison } from "../hooks/useStatistiques";
import { StatistiquesParams } from "../types/statistiques";
import { formatNombre, formatVariation } from "../utils/format";
import { StatistiqueCompareChart } from "./StatistiqueCompareChart";
import { StatistiquesSkeleton } from "./StatistiquesSkeleton";
import { SectionErreur } from "./SectionErreur";

interface SectionComparaisonProps {
  structureId: string;
  params: StatistiquesParams;
}

function BadgeVariation({ variation }: { variation: number | null }) {
  if (variation === null) {
    return (
      <Badge variant="outline" className="gap-1">
        <Minus className="h-3 w-3" />
        n.c.
      </Badge>
    );
  }
  if (variation >= 0) {
    return (
      <Badge variant="success" className="gap-1">
        <ArrowUpRight className="h-3 w-3" />
        {formatVariation(variation)}
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="gap-1">
      <ArrowDownRight className="h-3 w-3" />
      {formatVariation(variation)}
    </Badge>
  );
}

export function SectionComparaison({
  structureId,
  params,
}: SectionComparaisonProps) {
  const { data, isLoading, error, refetch } = useComparaison(
    structureId,
    params
  );

  if (isLoading) return <StatistiquesSkeleton />;
  if (error || !data) return <SectionErreur onReessayer={() => refetch()} />;

  if (!data.periode_precedente || !data.ventes) {
    return (
      <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
        La comparaison n&apos;est disponible que lorsque la période possède une
        période précédente équivalente (par exemple « Ce mois » vs « Mois
        précédent »).
      </p>
    );
  }

  const lignes = [
    {
      libelle: "Ventes validées",
      donnees: data.ventes,
    },
    {
      libelle: "Approvisionnements",
      donnees: data.approvisionnements,
    },
    {
      libelle: "Ruptures de stock",
      donnees: data.ruptures,
    },
    {
      libelle: "Retours caisse",
      donnees: data.retours_caisse,
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Comparaison de{" "}
        <span className="font-medium text-foreground">
          {data.periode_actuelle.libelle}
        </span>{" "}
        avec{" "}
        <span className="font-medium text-foreground">
          {data.periode_precedente.libelle}
        </span>
      </p>

      <StatistiqueCompareChart
        data={lignes.flatMap((ligne) =>
          ligne.donnees
            ? [
                {
                  indicateur: ligne.libelle,
                  actuel: ligne.donnees.actuel,
                  precedent: ligne.donnees.precedent,
                },
              ]
            : []
        )}
        libelleActuel={data.periode_actuelle.libelle}
        libellePrecedent={data.periode_precedente.libelle}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Indicateur</TableHead>
            <TableHead className="text-right">Période actuelle</TableHead>
            <TableHead className="text-right">Période précédente</TableHead>
            <TableHead className="text-right">Variation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lignes.map(
            (ligne) =>
              ligne.donnees && (
                <TableRow key={ligne.libelle}>
                  <TableCell className="font-medium">{ligne.libelle}</TableCell>
                  <TableCell className="text-right">
                    {formatNombre(ligne.donnees.actuel)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNombre(ligne.donnees.precedent)}
                  </TableCell>
                  <TableCell className="text-right">
                    <BadgeVariation variation={ligne.donnees.variation} />
                  </TableCell>
                </TableRow>
              )
          )}
        </TableBody>
      </Table>
    </div>
  );
}
