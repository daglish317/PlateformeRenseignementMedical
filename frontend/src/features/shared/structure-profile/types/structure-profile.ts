export interface StructureProfile {
  id: string;
  nom: string;
  type: "HOPITAL" | "PHARMACIE";
  photo: string | null;
  adresse: string;
  telephone: string;
  latitude: number | null;
  longitude: number | null;
  statut: "EN_ATTENTE" | "ACTIVE" | "REFUSEE";
  date_creation: string;
  date_validation: string | null;
  motif_refus: string | null;
  gestionnaire_nom: string;
  gestionnaire_email: string;
}

export interface UpdateStructurePayload {
  nom?: string;
  adresse?: string;
  telephone?: string;
}
