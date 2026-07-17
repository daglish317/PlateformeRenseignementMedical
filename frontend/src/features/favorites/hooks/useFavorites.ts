"use client";

import { useQuery } from "@tanstack/react-query";
import { getFavorites } from "../api/favorites.service";
import { useFavoritesStore } from "../store/favorites-store";

export function useFavorites() {
  const lastUpdated = useFavoritesStore((state) => state.lastUpdated);

  return useQuery({
    queryKey: ["favorites", lastUpdated],
    queryFn: getFavorites,
  });
}
