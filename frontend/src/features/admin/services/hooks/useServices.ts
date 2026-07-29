import { useQuery } from "@tanstack/react-query";
import { serviceService } from "../api/service.service";
import type { ServiceFilters } from "../types/service";

export function useServices(filters: ServiceFilters) {
  const params: Record<string, string | number> = {};

  if (filters.search) params.nom = filters.search;
  if (filters.type) params.type = filters.type;

  return useQuery({
    queryKey: ["admin", "services", filters],
    queryFn: () => serviceService.list(params),
    staleTime: 30_000,
  });
}
