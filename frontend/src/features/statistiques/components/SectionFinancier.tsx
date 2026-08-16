"use client";

import { Lock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAnalyseFinanciere } from "../hooks/useStatistiques";
import { StatistiquesParams } from "../types/statistiques";
import { formatMontant, formatNombre } from "../utils/format";
import { StatistiqueCards } from "./StatistiqueCards";
import { StatistiqueDonutChart } from "./StatistiqueDonutChart";
import { StatistiquesSkeleton } from "./StatistiquesSkeleton";
import { SectionErreur } from "./SectionErreur";

interface SectionFinancierProps {
  structureId: string;
  params: StatistiquesParams;
}

export function SectionFinancier({
  structureId,
  params,
}: SectionFinancierProps) {
  const { data, isLoading, error, refetch } = useAnalyseFinanciere(
    structureId,
    params
  );

  if (isLoading) return <StatistiquesSkeleton />;
  if (error || !data) return <SectionErreur onReessayer={() => refetch()} />;

  const { chiffre_affaires } = data;

  return (
    <div className="space-y-6">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="h-4 w-4" />
        Section strictement réservée au propriétaire.
      </p>

      <StatistiqueCards
        cartes={[
          {
            titre: "Chiffre d'affaires brut",
            valeur: formatMontant(chiffre_affaires.brut),
          },
          {
            titre: "Retours",
            valeur: formatMontant(chiffre_affaires.retours),
            ton: "warning",
          },
          {
            titre: "Chiffre d'affaires net",
            valeur: formatMontant(chiffre_affaires.net),
          },
          {
            titre: "Panier moyen",
            valeur: formatMontant(data.panier_moyen),
            detail: `${formatNombre(data.nb_ventes_encaissees)} ventes`,
          },
          {
            titre: "Coût des marchandises vendues",
            valeur: formatMontant(data.cout_marchandises),
          },
          {
            titre: "Bénéfice brut",
            valeur: formatMontant(data.benefice_brut),
            ton: data.benefice_brut >= 0 ? "success" : "destructive",
          },
          {
            titre: "Marge",
            valeur:
              data.marge_pourcentage === null ||
              data.marge_pourcentage === undefined
                ? "—"
                : `${data.marge_pourcentage.toLocaleString("fr-FR")} %`,
          },
          {
            titre: "Produits vendus",
            valeur: formatNombre(data.nb_produits_vendus),
          },
        ]}
      />

      <div className="rounded-xl border bg-card p-4">
        <h4 className="mb-4 text-sm font-semibold">
          Répartition par mode de paiement
        </h4>
        {data.par_mode.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            Aucune donnée sur la période.
          </p>
        ) : (
          <>
            <StatistiqueDonutChart
              data={data.par_mode.map((mode) => ({
                nom: mode.label,
                valeur: mode.montant,
              }))}
              formatValeur={formatMontant}
            />
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mode</TableHead>
                <TableHead className="text-right">Nombre</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead className="text-right">Part</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.par_mode.map((mode) => (
                <TableRow key={mode.mode}>
                  <TableCell className="font-medium">{mode.label}</TableCell>
                  <TableCell className="text-right">
                    {formatNombre(mode.nombre)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatMontant(mode.montant)}
                  </TableCell>
                  <TableCell className="text-right">
                    {mode.pourcentage === null ||
                    mode.pourcentage === undefined
                      ? "—"
                      : `${mode.pourcentage.toLocaleString("fr-FR")} %`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </>
        )}
      </div>
    </div>
  );
}
