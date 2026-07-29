export interface CareService {
  id: string;
  structure: string;
  service: { id: string; nom: string; type: string };
  niveau: string | null;
  date_ajout: string;
}

export interface ServiceItem {
  id: string;
  nom: string;
  type: string;
  description: string;
  est_actif: boolean;
}
