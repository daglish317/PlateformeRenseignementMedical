"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteCareService } from "../api/care-services.service";

export function useDeleteCareService(structureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCareService(id),
    onSuccess: () => {
      toast.success("Prise en charge supprimée");
      queryClient.invalidateQueries({ queryKey: ["care-services", structureId] });
    },
    onError: () => {
      toast.error("Impossible de supprimer cette prise en charge");
    },
  });
}
