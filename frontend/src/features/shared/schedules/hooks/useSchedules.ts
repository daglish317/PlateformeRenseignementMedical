import { useQuery } from "@tanstack/react-query";
import { schedulesService } from "../api/schedules.service";

export function useSchedules(structureId: string) {
  return useQuery({
    queryKey: ["schedules", structureId],
    queryFn: () => schedulesService.getSchedules(structureId),
  });
}
