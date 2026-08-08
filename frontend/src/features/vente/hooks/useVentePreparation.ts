"use client";
import { useQuery } from "@tanstack/react-query";
import { getVentePreparation } from "../api/vente.service";

export const VENTE_PREPARATION_QUERY_KEY = (structureId: string) =>
  ["vente-preparation", structureId] as const;

export function useVentePreparation(structureId: string) {
  return useQuery({
    queryKey: VENTE_PREPARATION_QUERY_KEY(structureId),
    queryFn: () => getVentePreparation(structureId),
    enabled: !!structureId,
    staleTime: 30 * 1000,
  });
}
