import { useQuery } from "@tanstack/react-query";
import { catalogService } from "../api/catalog.service";
import type { CatalogueFilters } from "../types/catalog";

export function useCatalogues(filters: CatalogueFilters) {
  const params: Record<string, string | number> = {
    page: filters.page,
    page_size: filters.pageSize,
  };

  if (filters.search) params.search = filters.search;
  if (filters.type) params.type = filters.type;

  return useQuery({
    queryKey: ["admin", "catalogues", filters],
    queryFn: () => catalogService.list(params),
    staleTime: 30_000,
  });
}
