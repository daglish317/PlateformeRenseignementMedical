"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deactivateAnalysis } from "../api/analyses.service";

export function useDeleteAnalysis(structureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deactivateAnalysis(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analyses", structureId] });
    },
  });
}
