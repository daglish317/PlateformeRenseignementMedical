"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { importCareServices } from "../api/care-services.service";

export function useImportCareService(structureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => importCareServices(structureId, file),
    onSuccess: (result) => {
      toast.success(result.message);
      if (result.errors_count > 0) {
        result.errors.slice(0, 3).forEach((e) =>
          toast.warning(`Ligne ${e.ligne}: ${e.erreur}`)
        );
      }
      queryClient.invalidateQueries({ queryKey: ["care-services", structureId] });
    },
    onError: () => {
      toast.error("Échec de l'import");
    },
  });
}
