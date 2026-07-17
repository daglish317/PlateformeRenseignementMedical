import axios from "@/lib/axios";
import type { Favorite } from "../types/favorite";

export const getFavorites = async (): Promise<Favorite[]> => {
  const { data } = await axios.get<Favorite[]>("/api/favoris/");
  return data;
};

export const addFavorite = async (structureId: string): Promise<Favorite> => {
  const { data } = await axios.post<Favorite>("/api/favoris/add/", { structure_id: structureId });
  return data;
};

export const removeFavorite = async (structureId: string): Promise<void> => {
  await axios.delete(`/api/favoris/${structureId}/remove/`);
};

export const checkFavorite = async (structureId: string): Promise<{ isFavorite: boolean }> => {
  const { data } = await axios.get<{ isFavorite: boolean }>(`/api/favoris/${structureId}/check/`);
  return data;
};
