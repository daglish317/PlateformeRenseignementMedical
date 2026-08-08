"use client";

import { Trophy, TrendingDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProduitsVendus } from "../hooks/useStatistiques";
import { StatistiquesParams } from "../types/statistiques";
import { formatMontant, formatNombre } from "../utils/format";
import { StatistiquesSkeleton } from "./StatistiquesSkeleton";
import { SectionErreur } from "./SectionErreur";

interface SectionProduitsProps {
  structureId: string;
  params: StatistiquesParams;
}

function TableauProduits({
  produits,
}: {
  produits: { nom: string; quantite: number; montant: number }[];
}) {
  if (produits.length === 0) {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        Aucun produit vendu sur la période.
      </p>
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Produit</TableHead>
          <TableHead className="text-right">Quantité</TableHead>
          <TableHead className="text-right">Montant</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {produits.map((produit) => (
          <TableRow key={produit.nom}>
            <TableCell className="font-medium">{produit.nom}</TableCell>
            <TableCell className="text-right">
              {formatNombre(produit.quantite)}
            </TableCell>
            <TableCell className="text-right">
              {formatMontant(produit.montant)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function SectionProduits({
  structureId,
  params,
}: SectionProduitsProps) {
  const { data, isLoading, error, refetch } = useProduitsVendus(
    structureId,
    params
  );

  if (isLoading) return <StatistiquesSkeleton />;
  if (error || !data) return <SectionErreur onReessayer={() => refetch()} />;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border bg-card p-4">
        <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Trophy className="h-4 w-4 text-success" />
          Produits les plus vendus
        </h4>
        <TableauProduits produits={data.plus_vendus} />
      </div>
      <div className="rounded-xl border bg-card p-4">
        <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <TrendingDown className="h-4 w-4 text-warning" />
          Produits les moins vendus
        </h4>
        <TableauProduits produits={data.moins_vendus} />
      </div>
    </div>
  );
}
