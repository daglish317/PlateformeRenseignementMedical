import api from "@/lib/axios";
import type { UserAdmin } from "../types/user";

interface UsersListResponse {
  results: UserAdmin[];
  page: number;
  page_size: number;
  total: number;
}

export const usersService = {
  list: async (params: Record<string, string | number>): Promise<UsersListResponse> => {
    const response = await api.get("/utilisateurs/admin/users/", { params });
    return response.data;
  },
  detail: async (id: string): Promise<UserAdmin> => {
    const response = await api.get(`/utilisateurs/admin/users/${id}/`);
    return response.data;
  },
  suspend: async (id: string): Promise<{ message: string }> => {
    const response = await api.patch(`/utilisateurs/admin/users/${id}/`, { action: "suspend" });
    return response.data;
  },
  reactivate: async (id: string): Promise<{ message: string }> => {
    const response = await api.patch(`/utilisateurs/admin/users/${id}/`, { action: "reactivate" });
    return response.data;
  },
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.patch(`/utilisateurs/admin/users/${id}/`, { action: "delete" });
    return response.data;
  },
};
