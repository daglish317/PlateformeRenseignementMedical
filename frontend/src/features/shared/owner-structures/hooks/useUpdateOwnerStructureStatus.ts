"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ownerStructuresService } from "../api/owner-structures.service";
import type { UpdateOwnerStructureStatusPayload } from "../types/owner-structure";
import { OWNER_STRUCTURES_QUERY_KEY } from "./useOwnerStructures";

export function useUpdateOwnerStructureStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateOwnerStructureStatusPayload) =>
      ownerStructuresService.updateStatus(payload),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: OWNER_STRUCTURES_QUERY_KEY });
    },
    onError: () => {
      toast.error("Impossible de modifier le statut de la structure");
    },
  });
}
