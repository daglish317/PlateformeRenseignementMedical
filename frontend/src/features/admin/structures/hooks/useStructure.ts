import { useQuery } from "@tanstack/react-query";
import { structuresService } from "../api/structures.service";

export function useStructure(id: string | null) {
  return useQuery({
    queryKey: ["admin", "structure", id],
    queryFn: () => structuresService.detail(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}
