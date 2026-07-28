import api from "@/lib/axios";
import type { UserProfile, ChangePasswordPayload } from "../types/settings";

export const settingsService = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>("/utilisateurs/me/");
    return response.data;
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await api.patch<UserProfile>("/utilisateurs/me/", data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordPayload): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>("/utilisateurs/change-password/", data);
    return response.data;
  },
};
