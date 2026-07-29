"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createService } from "../api/services.service";

export function useCreateService(structureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceId: string) => createService(structureId, serviceId),
    onSuccess: () => {
      toast.success("Service médical ajouté");
      queryClient.invalidateQueries({ queryKey: ["services", structureId] });
    },
    onError: () => {
      toast.error("Impossible d'ajouter ce service");
    },
  });
}
