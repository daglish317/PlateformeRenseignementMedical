import { useQuery } from "@tanstack/react-query";
import { usersService } from "../api/users.service";

export function useUser(id: string | null) {
  return useQuery({
    queryKey: ["admin", "user", id],
    queryFn: () => usersService.detail(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}
