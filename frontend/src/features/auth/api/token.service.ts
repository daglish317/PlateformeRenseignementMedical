import api from "@/lib/axios";
import { authStorage } from "@/features/auth/utils/auth-storage";
import { Tokens } from "@/features/auth/types/auth";

export const tokenService = {
  refreshToken: async (): Promise<Tokens> => {
    const refreshToken = authStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token");
    }

    const response = await api.post<Tokens>("/utilisateurs/token/refresh/", {
      refresh: refreshToken,
    });

    return response.data;
  },
};
