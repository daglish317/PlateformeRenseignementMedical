"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { favoritesService } from "../api/favorites.service";
import { useFavoritesStore } from "../store/favorites-store";

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  const triggerUpdate = useFavoritesStore((state) => state.triggerUpdate);

  return useMutation({
    mutationFn: (structureId: string) => favoritesService.remove(structureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["favorite-check"] });
      triggerUpdate();
    },
  });
}
