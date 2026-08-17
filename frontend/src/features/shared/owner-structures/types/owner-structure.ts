export type OwnerStructure = {
  id: string;
  nom: string;
  type: "HOPITAL" | "PHARMACIE";
  adresse?: string;
  telephone?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  statut: "EN_ATTENTE" | "ACTIVE" | "SUSPENDUE" | "REFUSEE";
};

export type OwnerStructuresResponse = {
  results: OwnerStructure[];
};

export type CreateOwnerStructurePayload = {
  nom: string;
  type: "HOPITAL" | "PHARMACIE";
  adresse?: string;
  telephone?: string;
  latitude?: string | null;
  longitude?: string | null;
};

export type UpdateOwnerStructureStatusPayload = {
  id: string;
  action: "ACTIVATE" | "DEACTIVATE";
};
