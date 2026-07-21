import api from "@/lib/axios";
import { AuthResponse, GoogleCredentials } from "@/features/auth/types/auth";

export const googleAuthService = {
  authenticate: async (
    credentials: GoogleCredentials
  ): Promise<AuthResponse> => {

    try {
      const response = await api.post<AuthResponse>(
        "/utilisateurs/google/",
        credentials
      );

      return response.data;

    } catch (error) {
      console.error(
        "Erreur authentification Google:",
        error
      );

      throw error;
    }
  },
};
