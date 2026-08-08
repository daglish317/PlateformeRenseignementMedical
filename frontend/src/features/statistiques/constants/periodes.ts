import { PeriodeStatistique } from "../types/statistiques";

export const PERIODES_RAPIDES_LABELS: ReadonlyArray<readonly [PeriodeStatistique, string]> = [
  ["aujourdhui", "Aujourd'hui"],
  ["hier", "Hier"],
  ["semaine", "Cette semaine"],
  ["semaine_precedente", "Semaine précédente"],
  ["mois", "Ce mois"],
  ["mois_precedent", "Mois précédent"],
  ["annee", "Cette année"],
  ["personnalisee", "Période personnalisée"],
];

export const ONGLETS_STATISTIQUES: ReadonlyArray<{
  id: string;
  label: string;
}> = [
  { id: "generale", label: "Vue générale" },
  { id: "ventes", label: "Ventes" },
  { id: "produits", label: "Produits" },
  { id: "approvisionnements", label: "Approvisionnements" },
  { id: "stock", label: "Stock" },
  { id: "caisse", label: "Caisse" },
  { id: "financier", label: "Financier" },
  { id: "comparaison", label: "Comparaison" },
  { id: "details", label: "Détails" },
];
