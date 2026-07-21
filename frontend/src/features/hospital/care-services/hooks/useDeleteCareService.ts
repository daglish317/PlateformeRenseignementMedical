"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCareService } from "../api/care-services.service";

export function useDeleteCareService(structureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCareService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["care-services", structureId] });
    },
  });
}
