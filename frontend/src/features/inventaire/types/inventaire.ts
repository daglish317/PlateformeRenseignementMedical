export type StatutInventaire = "DISPONIBLE" | "STOCK_FAIBLE" | "RUPTURE";

export interface InventaireLigne {
  id: string;
  medicament_id: string | null;
  nom: string;
  forme_pharmaceutique: string;
  quantite_physique: number;
  quantite_reservee: number;
  quantite_disponible: number;
  seuil_alerte: number;
  statut: StatutInventaire;
  statut_label: string;
}

export interface Inventaire {
  id: string;
  numero: string;
  structure_id: string;
  structure_nom: string;
  cree_par_nom: string;
  role_createur: string;
  cree_le: string;
  date_generation: string;
  heure_generation: string;
  nombre_total_produits: number;
  nombre_disponibles: number;
  nombre_stock_faible: number;
  nombre_ruptures: number;
  lignes?: InventaireLigne[];
}
