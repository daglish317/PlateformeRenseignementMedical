export type OwnerStructure = {
  id: string;
  nom: string;
  type: "HOPITAL" | "PHARMACIE";
  adresse?: string;
  telephone?: string;
  statut: string;
};

export type OwnerStructuresResponse = {
  results: OwnerStructure[];
};

export type CreateOwnerStructurePayload = {
  nom: string;
  type: "HOPITAL" | "PHARMACIE";
  adresse?: string;
  telephone?: string;
};
