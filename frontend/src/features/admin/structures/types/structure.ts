export type StructureStatut = "EN_ATTENTE" | "ACTIVE" | "SUSPENDUE" | "REFUSEE";
export type StructureType = "HOPITAL" | "PHARMACIE";

export interface StructureAdmin {
  id: string;
  nom: string;
  type: StructureType;
  statut: StructureStatut;
  photo: string | null;
  adresse: string;
  telephone?: string;
  motif_refus?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  date_creation: string;
  date_validation?: string | null;
  gestionnaire_nom?: string;
  gestionnaire_email?: string;
}

export interface StructureFilters {
  search: string;
  statut: string;
  type: string;
  page: number;
  pageSize: number;
  ordering: string;
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
}
