import api from "@/lib/axios";
import type { ManagerAdmin } from "../types/manager";

interface ManagersListResponse {
  results: ManagerAdmin[];
  page: number;
  page_size: number;
  total: number;
}

export const managersService = {
  list: async (params: Record<string, string | number>): Promise<ManagersListResponse> => {
    const response = await api.get("/utilisateurs/admin/managers/", { params });
    return response.data;
  },

  detail: async (id: string): Promise<ManagerAdmin> => {
    const response = await api.get(`/utilisateurs/admin/managers/${id}/`);
    return response.data;
  },

  create: async (data: { nom: string; email: string }): Promise<{ message: string; data: ManagerAdmin }> => {
    const response = await api.post("/utilisateurs/admin/managers/", data);
    return response.data;
  },

  suspend: async (id: string): Promise<{ message: string }> => {
    const response = await api.patch(`/utilisateurs/admin/managers/${id}/`, { action: "suspend" });
    return response.data;
  },

  reactivate: async (id: string): Promise<{ message: string }> => {
    const response = await api.patch(`/utilisateurs/admin/managers/${id}/`, { action: "reactivate" });
    return response.data;
  },

  resetPassword: async (id: string): Promise<{ message: string }> => {
    const response = await api.patch(`/utilisateurs/admin/managers/${id}/`, { action: "reset_password" });
    return response.data;
  },
};
