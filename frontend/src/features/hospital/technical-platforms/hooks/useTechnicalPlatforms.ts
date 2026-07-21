"use client";
import { useQuery } from "@tanstack/react-query";
import {
  getTechnicalPlatforms,
  getCatalogues,
} from "../api/technical-platforms.service";

export function useTechnicalPlatforms(structureId: string) {
  const platforms = useQuery({
    queryKey: ["technical-platforms", structureId],
    queryFn: () => getTechnicalPlatforms(structureId),
    enabled: !!structureId,
  });

  const catalogues = useQuery({
    queryKey: ["catalogues", "plateau-technique"],
    queryFn: () => getCatalogues("plateau-technique"),
  });

  return { platforms, catalogues };
}
