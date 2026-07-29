"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTechnicalPlatform } from "../api/technical-platforms.service";

export function useCreateTechnicalPlatform(structureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceId: string) =>
      createTechnicalPlatform(structureId, serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["technical-platforms", structureId],
      });
    },
  });
}
