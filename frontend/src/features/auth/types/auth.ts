import { User } from "./user";
import { RoleUtilisateur } from "./user";

export interface Tokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  tokens: Tokens;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  nom: string;
  email: string;
  password: string;
}

export interface GoogleCredentials {
  id_token: string;
}

export interface CheckGestionnaireResponse {
  is_invited: boolean;
  is_gestionnaire: boolean;
  is_invited_structure_user: boolean;
  requires_otp: boolean;
  role: RoleUtilisateur | null;
}
