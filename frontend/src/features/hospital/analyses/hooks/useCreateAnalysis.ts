"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAnalysis } from "../api/analyses.service";

export function useCreateAnalysis(structureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (catalogueId: string) => createAnalysis(structureId, catalogueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analyses", structureId] });
    },
  });
}
