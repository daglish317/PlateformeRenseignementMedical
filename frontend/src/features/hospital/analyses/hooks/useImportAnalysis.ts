"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { importAnalyses } from "../api/analyses.service";

export function useImportAnalysis(structureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => importAnalyses(structureId, file),
    onSuccess: (result) => {
      toast.success(result.message);
      if (result.errors_count > 0) {
        result.errors.slice(0, 3).forEach((e) =>
          toast.warning(`Ligne ${e.ligne}: ${e.erreur}`)
        );
      }
      queryClient.invalidateQueries({ queryKey: ["analyses", structureId] });
    },
    onError: () => {
      toast.error("Échec de l'import");
    },
  });
}
