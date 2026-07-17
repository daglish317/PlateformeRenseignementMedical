import api from "@/lib/axios";
import { AuthResponse, GoogleCredentials } from "@/features/auth/types/auth";

export const googleAuthService = {
  authenticate: async (credentials: GoogleCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/utilisateurs/google/", credentials);
    return response.data;
  },
};
