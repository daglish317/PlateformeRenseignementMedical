"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { importMedicaments } from "../api/stock.service";

export function useImportStock(structureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => importMedicaments(structureId, file),
    onSuccess: (result) => {
      toast.success(result.message);
      if (result.errors_count > 0) {
        const msgs = result.errors.slice(0, 3).map((e) => `Ligne ${e.ligne}: ${e.erreur}`).join("\n");
        toast.warning(`${result.errors_count} erreur(s):\n${msgs}`);
      }
      queryClient.invalidateQueries({ queryKey: ["stock", structureId] });
    },
    onError: () => {
      toast.error("Erreur lors de l'import du fichier");
    },
  });
}