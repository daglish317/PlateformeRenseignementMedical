"use client";
import { useQuery } from "@tanstack/react-query";
import { getProduitsPeremption } from "../api/peremption.service";

export function usePeremption(structureId: string) {
  return useQuery({
    queryKey: ["pharmacy-peremption", structureId],
    queryFn: () => getProduitsPeremption(structureId),
    enabled: !!structureId,
    staleTime: 60 * 1000,
  });
}
