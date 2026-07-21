"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deactivateService } from "../api/services.service";

export function useDeleteService(structureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deactivateService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", structureId] });
    },
  });
}
