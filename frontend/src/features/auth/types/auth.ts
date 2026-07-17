import { User } from "./user";

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
