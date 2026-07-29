export type ServiceType = "MALADIE" | "ANALYSE" | "EXAMEN" | "SERVICE_MEDICAL";

export interface Service {
  id: string;
  nom: string;
  type: ServiceType;
  description: string;
  slug: string;
  categorie: string;
  est_actif: boolean;
  date_creation: string;
  date_modification: string;
}

export interface ServiceFilters {
  search: string;
  type: string;
  page: number;
  pageSize: number;
}
