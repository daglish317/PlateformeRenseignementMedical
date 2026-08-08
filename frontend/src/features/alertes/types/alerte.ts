export type TypeAlerte =
  | "STOCK_FAIBLE"
  | "RUPTURE_STOCK"
  | "RETOURS_CAISSE_ANORMAUX"
  | "VENTES_ANNULEES_ANORMALES";

export type CategorieAlerte = "OPERATIONNELLE" | "SUPERVISION";

export type PrioriteAlerte = "CRITIQUE" | "MOYENNE" | "INFORMATION";

export type ModuleAlerte =
  | "APPROVISIONNEMENT"
  | "STOCK"
  | "VENTE"
  | "CAISSE"
  | "INVENTAIRE";

export type FiltreAlerte =
  | ""
  | "critiques"
  | "non_lues"
  | "stock_faible"
  | "rupture"
  | "supervision";

export interface AlerteStockDonnees {
  medicament_nom?: string;
  stock_disponible?: number;
  stock_physique?: number;
  quantite_reservee?: number;
  seuil_alerte?: number;
  [key: string]: unknown;
}

export interface AlerteSupervisionDonnees {
  nombre?: number;
  moyenne?: number;
  date_concernee?: string;
  [key: string]: unknown;
}

export type AlerteDonnees = AlerteStockDonnees & AlerteSupervisionDonnees;

export interface Alerte {
  id: string;
  structure_id: string;
  structure_nom: string;
  categorie: CategorieAlerte;
  categorie_label: string;
  type: TypeAlerte;
  type_label: string;
  priorite: PrioriteAlerte;
  priorite_label: string;
  module: ModuleAlerte;
  module_label: string;
  titre: string;
  description: string;
  cree_le: string;
  date_alerte: string;
  heure_alerte: string;
  est_resolue: boolean;
  est_lue: boolean;
  utilisateur_concerne_id: string | null;
  utilisateur_concerne_nom: string | null;
  donnees: AlerteDonnees;
}

export interface ResumeAlertes {
  total: number;
  critiques: number;
  non_lues: number;
  resolues: number;
}

export interface AlertesFiltres {
  recherche?: string;
  filtre?: FiltreAlerte;
  recherche_utilisateur?: string;
}
