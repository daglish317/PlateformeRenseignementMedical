"use client";
import { useQuery } from "@tanstack/react-query";
import { getAnalyses } from "../api/analyses.service";

export function useAnalyses(structureId: string) {
  const analyses = useQuery({
    queryKey: ["analyses", structureId],
    queryFn: () => getAnalyses(structureId),
    enabled: !!structureId,
  });

  return { analyses };
}
