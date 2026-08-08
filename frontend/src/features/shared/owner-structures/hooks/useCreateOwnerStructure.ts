"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ownerStructuresService } from "../api/owner-structures.service";
import type { CreateOwnerStructurePayload } from "../types/owner-structure";
import { OWNER_STRUCTURES_QUERY_KEY } from "./useOwnerStructures";

export function useCreateOwnerStructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOwnerStructurePayload) => ownerStructuresService.create(payload),
    onSuccess: (data) => {
      toast.success(data.message || "Structure creee");
      queryClient.invalidateQueries({ queryKey: OWNER_STRUCTURES_QUERY_KEY });
    },
    onError: () => {
      toast.error("Impossible de creer cette structure");
    },
  });
}
