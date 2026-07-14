
export type StructureType =
  | "HOPITAL"
  | "PHARMACIE";

export type Coordinates = {
  latitude: number;
  longitude: number;
};




export type StructureMap = {
  id: string;

  nom: string;

  type: StructureType;

  photo?: string | null;

  adresse: string;

  telephone: string;

  latitude: number;

  longitude: number;
};
