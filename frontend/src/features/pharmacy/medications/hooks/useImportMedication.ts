"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { importMedications } from "../api/medications.service";

export function useImportMedication(structureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => importMedications(structureId, file),
    onSuccess: (result) => {
      toast.success(result.message);
      if (result.errors_count > 0) {
        result.errors.slice(0, 3).forEach((e) =>
          toast.warning(`Ligne ${e.ligne}: ${e.erreur}`)
        );
      }
      queryClient.invalidateQueries({ queryKey: ["medications", structureId] });
    },
    onError: () => {
      toast.error("Échec de l'import");
    },
  });
}
