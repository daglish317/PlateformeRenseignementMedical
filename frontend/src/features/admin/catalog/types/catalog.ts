export type CatalogueType = "MALADIE" | "ANALYSE" | "EXAMEN" | "SERVICE_MEDICAL";

export interface Catalogue {
  id: string;
  nom: string;
  type: CatalogueType;
  description: string;
  est_actif: boolean;
  date_creation: string;
  date_modification: string;
}

export interface CatalogueFilters {
  search: string;
  type: string;
  page: number;
  pageSize: number;
}
