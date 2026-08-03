"use client";

import { useQuery } from "@tanstack/react-query";
import { favoritesService } from "../api/favorites.service";
import { useFavoritesStore } from "../store/favorites-store";
import { useAuthStore } from "@/features/auth/store/auth-store";

export function useCheckFavorite(structureId: string) {
  const lastUpdated = useFavoritesStore((state) => state.lastUpdated);
  const authenticated = useAuthStore((state) => state.authenticated);

  return useQuery({
    queryKey: ["favorite-check", structureId, lastUpdated],
    queryFn: () => favoritesService.check(structureId),
    enabled: !!structureId && authenticated,
  });
}
