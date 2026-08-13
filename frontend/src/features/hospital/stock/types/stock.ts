export type StockItemType = "MEDICAMENT" | "EQUIPEMENT" | "CONSOMMABLE";
export type MouvementType = "ENTREE" | "SORTIE";

export interface StockItem {
  id: string;
  structure: string;
  nom: string;
  type_item: StockItemType;
  forme_pharmaceutique?: string | null;
  forme_label?: string | null;
  quantite: number;
  seuil_alerte: number;
  disponible: boolean;
  date_ajout: string;
}

export interface StockMovement {
  id: string;
  item: string;
  type_mouvement: MouvementType;
  quantite: number;
  motif: string;
  created_at: string;
}

export interface CreateStockPayload {
  nom: string;
  quantite: number;
}
