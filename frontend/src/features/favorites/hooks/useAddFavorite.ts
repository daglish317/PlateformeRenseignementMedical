"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addFavorite } from "../api/favorites.service";
import { useFavoritesStore } from "../store/favorites-store";

export function useAddFavorite() {
  const queryClient = useQueryClient();
  const triggerUpdate = useFavoritesStore((state) => state.triggerUpdate);

  return useMutation({
    mutationFn: addFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["favorite-check"] });
      triggerUpdate();
    },
  });
}
