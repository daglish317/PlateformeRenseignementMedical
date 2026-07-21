"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCareService } from "../api/care-services.service";

export function useCreateCareService(structureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (catalogueId: string) =>
      createCareService(structureId, catalogueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["care-services", structureId] });
    },
  });
}
