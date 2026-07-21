"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deactivateTechnicalPlatform } from "../api/technical-platforms.service";

export function useDeleteTechnicalPlatform(structureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deactivateTechnicalPlatform(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["technical-platforms", structureId],
      });
    },
  });
}
