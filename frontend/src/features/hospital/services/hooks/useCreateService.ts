"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createService } from "../api/services.service";

export function useCreateService(structureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (catalogueId: string) => createService(structureId, catalogueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", structureId] });
    },
  });
}
