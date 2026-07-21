export type StructureStatut = "EN_ATTENTE" | "ACTIVE" | "REFUSEE";
export type StructureType = "HOPITAL" | "PHARMACIE";

export interface StructureAdmin {
  id: string;
  nom: string;
  type: StructureType;
  statut: StructureStatut;
  photo: string | null;
  adresse: string;
  telephone?: string;
  email?: string;
  latitude?: number | null;
  longitude?: number | null;
  date_creation: string;
  date_validation?: string | null;
  description?: string;
  gestionnaire?: {
    id: string;
    nom: string;
    email: string;
  } | null;
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
