export interface MedicalService {
  id: string;
  structure: string;
  service: { id: string; nom: string; type: string };
  actif: boolean;
  date_ajout: string;
}

export interface ServiceItem {
  id: string;
  nom: string;
  type: string;
  description: string;
  est_actif: boolean;
}
