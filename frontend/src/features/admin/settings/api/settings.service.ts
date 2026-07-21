import api from "@/lib/axios";
import type { AdminProfile, ChangePasswordPayload } from "../types/settings";

export const settingsService = {
  getProfile: async (): Promise<AdminProfile> => {
    const response = await api.get<AdminProfile>("/utilisateurs/me/");
    return response.data;
  },

  updateProfile: async (data: Partial<AdminProfile>): Promise<AdminProfile> => {
    const response = await api.patch<AdminProfile>("/utilisateurs/me/", data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordPayload): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>("/utilisateurs/change-password/", data);
    return response.data;
  },
};
