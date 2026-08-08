"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAnalyseCaisse } from "../hooks/useStatistiques";
import { StatistiquesParams } from "../types/statistiques";
import { formatMontant, formatNombre } from "../utils/format";
import { StatistiqueBarChart } from "./StatistiqueBarChart";
import { StatistiqueCards } from "./StatistiqueCards";
import { StatistiquesSkeleton } from "./StatistiquesSkeleton";
import { SectionErreur } from "./SectionErreur";

interface SectionCaisseProps {
  structureId: string;
  params: StatistiquesParams;
}

export function SectionCaisse({
  structureId,
  params,
}: SectionCaisseProps) {
  const { data, isLoading, error, refetch } = useAnalyseCaisse(
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
            titre: "Paiements encaissés",
            valeur: formatNombre(data.paiements.nombre),
            detail: formatMontant(data.paiements.montant),
            variation: data.paiements.evolution,
          },
          {
            titre: "Retours caisse",
            valeur: formatNombre(data.retours.nombre),
            detail: formatMontant(data.retours.montant),
            variation: data.retours.evolution,
          },
          {
            titre: "Annulations",
            valeur: formatNombre(data.annulations.nombre),
            variation: data.annulations.evolution,
          },
          {
            titre: "Fréquence des retours",
            valeur: `${data.retours.frequence_jour.toLocaleString("fr-FR")} / jour`,
          },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <h4 className="mb-4 text-sm font-semibold">
            Paiements par mode
          </h4>
          {data.paiements_par_mode.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              Aucun paiement sur la période.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mode</TableHead>
                  <TableHead className="text-right">Nombre</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.paiements_par_mode.map((mode) => (
                  <TableRow key={mode.mode}>
                    <TableCell className="font-medium">{mode.label}</TableCell>
                    <TableCell className="text-right">
                      {formatNombre(mode.nombre)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatMontant(mode.montant)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h4 className="mb-4 text-sm font-semibold">
            Retours caisse par période
          </h4>
          <StatistiqueBarChart
            data={data.retours.series}
            color="bg-orange-500"
          />
        </div>
      </div>
    </div>
  );
}
