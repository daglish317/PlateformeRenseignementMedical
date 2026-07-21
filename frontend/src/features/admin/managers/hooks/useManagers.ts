import { useQuery } from "@tanstack/react-query";
import { managersService } from "../api/managers.service";
import type { ManagerFilters } from "../types/manager";

export function useManagers(filters: ManagerFilters) {
  const params: Record<string, string | number> = {
    page: filters.page,
    page_size: filters.pageSize,
    ordering: filters.ordering,
  };

  if (filters.search) params.search = filters.search;
  if (filters.statut) params.statut = filters.statut;
  if (filters.type_structure) params.type_structure = filters.type_structure;

  return useQuery({
    queryKey: ["admin", "managers", filters],
    queryFn: () => managersService.list(params),
    staleTime: 30_000,
  });
}
