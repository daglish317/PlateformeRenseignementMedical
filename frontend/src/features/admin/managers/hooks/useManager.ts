import { useQuery } from "@tanstack/react-query";
import { managersService } from "../api/managers.service";

export function useManager(id: string | null) {
  return useQuery({
    queryKey: ["admin", "manager", id],
    queryFn: () => managersService.detail(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}
