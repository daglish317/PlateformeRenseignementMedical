"use client";
import { useQuery } from "@tanstack/react-query";
import { getTechnicalPlatforms } from "../api/technical-platforms.service";

export function useTechnicalPlatforms(structureId: string) {
  const platforms = useQuery({
    queryKey: ["technical-platforms", structureId],
    queryFn: () => getTechnicalPlatforms(structureId),
    enabled: !!structureId,
  });

  return { platforms };
}
