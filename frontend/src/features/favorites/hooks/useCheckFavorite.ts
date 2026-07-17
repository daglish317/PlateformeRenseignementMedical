"use client";

import { useQuery } from "@tanstack/react-query";
import { checkFavorite } from "../api/favorites.service";
import { useFavoritesStore } from "../store/favorites-store";

export function useCheckFavorite(structureId: string) {
  const lastUpdated = useFavoritesStore((state) => state.lastUpdated);

  return useQuery({
    queryKey: ["favorite-check", structureId, lastUpdated],
    queryFn: () => checkFavorite(structureId),
    enabled: !!structureId,
  });
}
