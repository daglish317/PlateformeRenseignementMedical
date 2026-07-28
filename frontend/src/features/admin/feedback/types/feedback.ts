export type FeedbackStatut = "NON_LU" | "LU" | "TRAITE";
export type FeedbackCategorie = "BUG" | "SUGGESTION" | "SIGNALEMENT" | "AUTRE";

export interface FeedbackAdmin {
  id: string;
  utilisateur_nom: string;
  utilisateur_email: string;
  categorie: FeedbackCategorie;
  sujet: string;
  message: string;
  statut: FeedbackStatut;
  note: number;
  date_creation: string;
  structure: string | null;
}

export interface FeedbackFilters {
  search: string;
  statut: string;
  categorie: string;
  page: number;
  pageSize: number;
}
