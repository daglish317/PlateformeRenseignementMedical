export interface MedicamentAvecStock {
  id: string;
  nom: string;
  forme_pharmaceutique: string;
  forme_label: string;
  prix_vente: number | null;
  tva: boolean;
  en_reserve: boolean;
  stock_physique: number;
  stock_disponible: number;
  date_creation: string;
}

export type EtatVente =
  | "EN_PREPARATION"
  | "EN_ATTENTE_PAIEMENT"
  | "PAYEE"
  | "ANNULEE"
  | "EXPIREE";

export interface LigneVente {
  id: string;
  medicament: string;
  designation: string;
  forme_pharmaceutique: string;
  forme_label: string;
  prix_unitaire: number;
  quantite: number;
  montant: number;
}

export interface Paiement {
  id: string;
  mode: string;
  montant: number;
  encaisse_par: string;
  encaisse_par_nom: string;
  effectue_le: string;
}

export interface Facture {
  id: string;
  numero: string;
  vente: string;
  paiement: string;
  montant_total: number;
  nb_articles: number;
  cree_le: string;
}

export interface Vente {
  id: string;
  structure: string;
  numero: string;
  etat: EtatVente;
  etat_label: string;
  prepare_par: string;
  prepare_par_id: string;
  prepare_par_nom: string;
  cree_le: string;
  transmise_le: string | null;
  validee_le: string | null;
  annulee_le: string | null;
  annulee_par: string | null;
  date_expiration: string | null;
  motif_annulation: string;
  montant_total: number;
  nb_articles: number;
  lignes: LigneVente[];
  paiement: Paiement | null;
  facture: Facture | null;
  total_impressions?: number;
  structure_nom?: string;
  structure_adresse?: string;
  structure_telephone?: string;
}

export interface VenteAttente {
  structure: {
    id: string;
    nom: string;
    adresse: string;
    telephone: string;
  };
  results: Vente[];
}

export const MODES_PAIEMENT = [
  { value: "ESPECES", label: "Espèces" },
  { value: "MOBILE_MONEY", label: "Mobile money" },
  { value: "CARTE", label: "Carte bancaire" },
  { value: "CHEQUE", label: "Chèque" },
  { value: "VIREMENT", label: "Virement" },
] as const;

export type ModePaiementValue = (typeof MODES_PAIEMENT)[number]["value"];

export function formatMontant(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${value.toLocaleString("fr-FR")} FCFA`;
}
