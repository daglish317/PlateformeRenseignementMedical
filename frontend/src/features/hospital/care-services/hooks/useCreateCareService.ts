"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createCareService } from "../api/care-services.service";

export function useCreateCareService(structureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nom: string) => createCareService(structureId, nom),
    onSuccess: () => {
      toast.success("Prise en charge ajoutée");
      queryClient.invalidateQueries({ queryKey: ["care-services", structureId] });
    },
    onError: () => {
      toast.error("Impossible d'ajouter cette prise en charge");
    },
  });
}
