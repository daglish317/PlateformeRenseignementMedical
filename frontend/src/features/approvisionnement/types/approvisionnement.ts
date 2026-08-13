export const FORME_PHARMACEUTIQUE_OPTIONS = [
  { value: "COMPRIME", label: "Comprimé" },
  { value: "CAPSULE", label: "Capsule" },
  { value: "GELULE", label: "Gélule" },
  { value: "SIROP", label: "Sirop" },
  { value: "SOLUTION_BUVABLE", label: "Solution buvable" },
  { value: "INJECTABLE", label: "Injectable" },
  { value: "CREME", label: "Crème" },
  { value: "POMMADE", label: "Pommade" },
  { value: "GEL", label: "Gel" },
  { value: "SPRAY", label: "Spray" },
  { value: "COLLYRE", label: "Collyre" },
  { value: "SACHET", label: "Sachet" },
  { value: "AMPOULE", label: "Ampoule" },
  { value: "SUPPOSITOIRE", label: "Suppositoire" },
  { value: "AUTRE", label: "Autre" },
] as const;

export type FormePharmaceutiqueValue = (typeof FORME_PHARMACEUTIQUE_OPTIONS)[number]["value"];

export interface Medicament {
  id: string;
  nom: string;
  forme_pharmaceutique: FormePharmaceutiqueValue;
  forme_label: string;
  prix_vente: number | null;
  tva: boolean;
  en_reserve: boolean;
  stock_avant: number;
  stock_physique: number;
  stock_disponible: number;
  date_creation: string;
}

export interface LigneApprovisionnement {
  id: string;
  medicament: string;
  medicament_nom: string;
  forme_pharmaceutique: FormePharmaceutiqueValue;
  forme_label: string;
  quantite: number;
  prix_achat: number;
  prix_vente: number | null;
  date_peremption: string;
  tva: boolean;
  en_reserve: boolean;
  stock_avant: number;
}

export interface Approvisionnement {
  id: string;
  structure: string;
  date_reception: string;
  fournisseur: string;
  reference_bon: string;
  montant_total_declare: number;
  cree_par: string;
  cree_par_nom: string;
  cree_le: string;
  lignes: LigneApprovisionnement[];
}

export interface LigneInput {
  nom: string;
  forme_pharmaceutique: FormePharmaceutiqueValue;
  quantite: number;
  prix_achat: number;
  prix_vente: number | null;
  date_peremption: string;
  tva: boolean;
  en_reserve: boolean;
  stock_avant: number;
}

export interface LigneError {
  index: number;
  erreur: string;
}

export interface CreateApprovisionnementPayload {
  structure_id: string;
  date_reception: string;
  fournisseur: string;
  reference_bon: string;
  montant_total_declare: number;
  lignes: LigneInput[];
}

export interface ApprovisionnementErrorResponse {
  detail?: string;
  errors?: LigneError[];
  [key: string]: unknown;
}
