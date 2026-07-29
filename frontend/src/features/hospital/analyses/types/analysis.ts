export interface Analysis {
  id: string;
  structure: string;
  service: { id: string; nom: string; type: string };
  disponible: boolean;
  date_ajout: string;
}

export interface ServiceItem {
  id: string;
  nom: string;
  type: string;
  description: string;
  est_actif: boolean;
}
