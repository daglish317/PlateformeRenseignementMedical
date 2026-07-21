export interface MedicalService {
  id: string;
  structure: string;
  catalogue: { id: string; nom: string; type: string };
  actif: boolean;
  date_ajout: string;
}

export interface CatalogueItem {
  id: string;
  nom: string;
  type: string;
  description: string;
  est_actif: boolean;
}
