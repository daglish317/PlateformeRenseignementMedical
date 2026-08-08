"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createApprovisionnement } from "../api/approvisionnement.service";
import {
  Approvisionnement,
  CreateApprovisionnementPayload,
} from "../types/approvisionnement";

export function useCreateApprovisionnement(structureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: Omit<CreateApprovisionnementPayload, "structure_id">
    ): Promise<Approvisionnement> =>
      createApprovisionnement(structureId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvisionnements", structureId] });
      queryClient.invalidateQueries({ queryKey: ["stock", structureId] });
    },
  });
}
