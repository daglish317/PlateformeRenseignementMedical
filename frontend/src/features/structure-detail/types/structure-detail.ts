export type Service = {
  id: string;
  nom: string;
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
};
