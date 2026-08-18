import type { StructureType } from "@/types/map";

export type RoleUtilisateur =
  | "ADMINISTRATEUR"
  | "PROPRIETAIRE"
  | "GESTIONNAIRE"
  | "CAISSIER"
  | "PATIENT";

export type TypeAuthentification = "EMAIL" | "GOOGLE";

export interface ActiveStructure {
  id: string;
  nom: string;
  type: StructureType;
}

export interface User {
  id: string;
  nom: string;
  email: string;
  role: RoleUtilisateur;
  type_authentification: TypeAuthentification;
  email_verifie: boolean;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  active_structure?: ActiveStructure | null;
}
