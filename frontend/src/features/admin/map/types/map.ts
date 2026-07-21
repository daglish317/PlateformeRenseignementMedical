export type StructureType = "HOPITAL" | "PHARMACIE";
export type StructureStatut = "EN_ATTENTE" | "ACTIVE" | "REFUSEE";

export interface AdminMapStructure {
  id: string;
  nom: string;
  type: StructureType;
  photo: string | null;
  adresse: string;
  telephone?: string;
  latitude: number;
  longitude: number;
  statut: StructureStatut;
}
