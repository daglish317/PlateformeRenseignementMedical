"use client";
import { useQuery } from "@tanstack/react-query";
import { searchMedicaments } from "../api/approvisionnement.service";

export function useMedicamentSearch(structureId: string, search: string) {
  return useQuery({
    queryKey: ["medicaments-search", structureId, search],
    queryFn: () => searchMedicaments(structureId, search),
    enabled: !!structureId && search.trim().length > 0,
    staleTime: 60 * 1000,
  });
}
