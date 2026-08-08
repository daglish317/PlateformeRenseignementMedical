"use client";

import { useVueGenerale } from "../hooks/useStatistiques";
import { StatistiquesParams } from "../types/statistiques";
import { formatMontant, formatNombre } from "../utils/format";
import { StatistiqueCards } from "./StatistiqueCards";
import { StatistiquesSkeleton } from "./StatistiquesSkeleton";
import { SectionErreur } from "./SectionErreur";

interface SectionVueGeneraleProps {
  structureId: string;
  params: StatistiquesParams;
}

export function SectionVueGenerale({
  structureId,
  params,
}: SectionVueGeneraleProps) {
  const { data, isLoading, error, refetch } = useVueGenerale(
    structureId,
    params
  );

  if (isLoading) return <StatistiquesSkeleton />;
  if (error || !data) return <SectionErreur onReessayer={() => refetch()} />;

  const { ventes, approvisionnements, stock, caisse } = data;

  return (
    <div className="space-y-4">
      <StatistiqueCards
        cartes={[
          {
            titre: "Chiffre d'affaires",
            valeur: formatMontant(ventes.ca),
            variation: ventes.evolution_ventes,
            detail: `${formatNombre(ventes.nb_validees)} ventes`,
          },
          {
            titre: "Produits vendus",
            valeur: formatNombre(ventes.nb_produits_vendus),
            variation: ventes.evolution_produits,
          },
          {
            titre: "Approvisionnements",
            valeur: formatNombre(approvisionnements.nombre),
            variation: approvisionnements.evolution,
            detail: `${formatNombre(approvisionnements.quantite_totale)} unités`,
          },
          {
            titre: "Valeur du stock (vente)",
            valeur: formatMontant(stock.valeur_actuelle),
            detail: `Achat : ${formatMontant(stock.valeur_achat)}`,
          },
          {
            titre: "Références en stock",
            valeur: formatNombre(stock.nb_references),
            detail: `${formatNombre(stock.nb_references_disponibles)} disponibles`,
          },
          {
            titre: "Ruptures",
            valeur: formatNombre(stock.nb_ruptures),
            detail: `${formatNombre(stock.nb_sous_seuil)} sous le seuil`,
            ton: stock.nb_ruptures > 0 ? "destructive" : "success",
          },
          {
            titre: "Retours caisse",
            valeur: formatNombre(caisse.nb_retours),
            detail: formatMontant(caisse.montant_retours),
          },
          {
            titre: "Annulations",
            valeur: formatNombre(caisse.nb_annulations),
          },
        ]}
      />
    </div>
  );
}
