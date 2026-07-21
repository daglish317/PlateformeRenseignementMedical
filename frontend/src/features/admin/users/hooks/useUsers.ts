import { useQuery } from "@tanstack/react-query";
import { usersService } from "../api/users.service";
import type { UserFilters } from "../types/user";

export function useUsers(filters: UserFilters) {
  const params: Record<string, string | number> = {
    page: filters.page,
    page_size: filters.pageSize,
    ordering: filters.ordering,
  };

  if (filters.search) params.search = filters.search;
  if (filters.statut) params.statut = filters.statut;

  return useQuery({
    queryKey: ["admin", "users", filters],
    queryFn: () => usersService.list(params),
    staleTime: 30_000,
  });
}
