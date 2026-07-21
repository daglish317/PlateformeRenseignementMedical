import { useQuery } from "@tanstack/react-query";
import { mapService } from "../api/map.service";

export function useStructuresMap() {
  return useQuery({
    queryKey: ["admin", "map", "structures"],
    queryFn: mapService.listStructures,
    staleTime: 60_000,
  });
}
