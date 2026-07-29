"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deactivateService } from "../api/services.service";

export function useDeleteService(structureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deactivateService(id),
    onSuccess: () => {
      toast.success("Service désactivé");
      queryClient.invalidateQueries({ queryKey: ["services", structureId] });
    },
    onError: () => {
      toast.error("Impossible de désactiver ce service");
    },
  });
}
