export type Service = {
  id: string;
  nom: string;
};

export type StructureScheduleDay = {
  jour: string;
  plages: {
    ouverture: string;
    fermeture: string;
  }[];
  est_ferme: boolean;
};

export type StructureProduit = {
  id: string;
  nom: string;
  quantite: number;
};

export type StructureDetail = {
  id: string;
  nom: string;
  type: string;
  adresse: string;
  telephone?: string;
  email?: string;
  photo?: string | null;
  latitude: number;
  longitude: number;
  services: Service[];
  description?: string;
  ouverture?: string;
  website?: string;
  plateauTechnique?: string[];
  est_ouverte: boolean;
  horaires: StructureScheduleDay[];
  produits: StructureProduit[];
  produits_total: number;
};

export type StructureProduitsResponse = {
  results: StructureProduit[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
};
