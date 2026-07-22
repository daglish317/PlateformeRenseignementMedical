import api from "@/lib/axios";
import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
} from "@/features/auth/types/auth";
import { User } from "@/features/auth/types/user";

export const authService = {
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/utilisateurs/register/", credentials);
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/utilisateurs/login/", credentials);
    return response.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post("/utilisateurs/logout/", { refresh: refreshToken });
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<User>("/utilisateurs/me/");
    return response.data;
  },

  checkGestionnaire: async (email: string): Promise<{ is_gestionnaire: boolean }> => {
    const response = await api.post("/utilisateurs/gestionnaire/check/", { email });
    return response.data;
  },

  activateGestionnaire: async (
    email: string,
    code: string,
    password: string
  ): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/utilisateurs/gestionnaire/activate/", {
      email,
      code,
      password,
    });
    return response.data;
  },
};
