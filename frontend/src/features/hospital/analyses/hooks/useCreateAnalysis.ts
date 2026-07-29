"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createAnalysis } from "../api/analyses.service";

export function useCreateAnalysis(structureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nom: string) => createAnalysis(structureId, nom),
    onSuccess: () => {
      toast.success("Analyse ajoutée");
      queryClient.invalidateQueries({ queryKey: ["analyses", structureId] });
    },
    onError: () => {
      toast.error("Impossible d'ajouter cette analyse");
    },
  });
}
