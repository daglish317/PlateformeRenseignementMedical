"use client";

import { useQuery } from "@tanstack/react-query";
import { favoritesService } from "../api/favorites.service";
import { useFavoritesStore } from "../store/favorites-store";

export function useCheckFavorite(structureId: string) {
  const lastUpdated = useFavoritesStore((state) => state.lastUpdated);

  return useQuery({
    queryKey: ["favorite-check", structureId, lastUpdated],
    queryFn: () => favoritesService.check(structureId),
    enabled: !!structureId,
  });
}
