"use client";
import { useQuery } from "@tanstack/react-query";
import { getAnalyses, getCatalogues } from "../api/analyses.service";

export function useAnalyses(structureId: string) {
  const analyses = useQuery({
    queryKey: ["analyses", structureId],
    queryFn: () => getAnalyses(structureId),
    enabled: !!structureId,
  });

  const catalogues = useQuery({
    queryKey: ["catalogues", "analyse"],
    queryFn: () => getCatalogues("analyse"),
  });

  return { analyses, catalogues };
}
