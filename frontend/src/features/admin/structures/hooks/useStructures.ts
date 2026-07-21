import { useQuery } from "@tanstack/react-query";
import { structuresService } from "../api/structures.service";
import type { StructureFilters } from "../types/structure";

export function useStructures(filters: StructureFilters) {
  const params: Record<string, string | number> = {
    page: filters.page,
    page_size: filters.pageSize,
    ordering: filters.ordering,
  };

  if (filters.search) params.search = filters.search;
  if (filters.statut) params.statut = filters.statut;
  if (filters.type) params.type = filters.type;

  return useQuery({
    queryKey: ["admin", "structures", filters],
    queryFn: () => structuresService.list(params),
    staleTime: 30_000,
  });
}
