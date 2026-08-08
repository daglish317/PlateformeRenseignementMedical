"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createVente } from "../api/vente.service";
import { VENTE_PREPARATION_QUERY_KEY } from "./useVentePreparation";

export function useCreateVente(structureId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => createVente(structureId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: VENTE_PREPARATION_QUERY_KEY(structureId),
      });
    },
    onError: () => {
      toast.error("Impossible de créer une nouvelle vente.");
    },
  });
}
