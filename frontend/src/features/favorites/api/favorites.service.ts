import api from "@/lib/axios";
import type { Favorite } from "../types/favorite";

interface FavoritesListResponse {
  results: Favorite[];
  page: number;
  page_size: number;
  total: number;
}

export const favoritesService = {
  list: async (params?: Record<string, string | number>): Promise<FavoritesListResponse> => {
    const response = await api.get<FavoritesListResponse>("/structures/favoris/", { params });
    return response.data;
  },

  add: async (structureId: string): Promise<Favorite> => {
    const response = await api.post<{ message: string; data: Favorite }>("/structures/favoris/add/", { structure_id: structureId });
    return response.data.data;
  },

  remove: async (structureId: string): Promise<void> => {
    await api.delete(`/structures/favoris/${structureId}/remove/`);
  },

  check: async (structureId: string): Promise<{ is_favori: boolean }> => {
    const response = await api.get<{ is_favori: boolean }>(`/structures/favoris/${structureId}/check/`);
    return response.data;
  },
};
