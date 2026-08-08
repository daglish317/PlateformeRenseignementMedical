"use client";
import { useQuery } from "@tanstack/react-query";
import { searchMedicamentsVente } from "../api/vente.service";

export function useMedicamentVenteSearch(structureId: string, search: string) {
  return useQuery({
    queryKey: ["medicaments-vente-search", structureId, search],
    queryFn: () => searchMedicamentsVente(structureId, search),
    enabled: !!structureId && search.trim().length > 0,
    staleTime: 60 * 1000,
  });
}
