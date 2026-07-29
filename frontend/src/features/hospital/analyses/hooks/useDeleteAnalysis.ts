"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deactivateAnalysis } from "../api/analyses.service";

export function useDeleteAnalysis(structureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deactivateAnalysis(id),
    onSuccess: () => {
      toast.success("Analyse désactivée");
      queryClient.invalidateQueries({ queryKey: ["analyses", structureId] });
    },
    onError: () => {
      toast.error("Impossible de désactiver cette analyse");
    },
  });
}
