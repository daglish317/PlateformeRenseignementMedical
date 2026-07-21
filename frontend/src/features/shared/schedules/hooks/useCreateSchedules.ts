import { useMutation, useQueryClient } from "@tanstack/react-query";
import { schedulesService } from "../api/schedules.service";
import { SchedulePayload } from "../types/schedule";

export function useCreateSchedules(structureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schedules: SchedulePayload[]) =>
      schedulesService.setSchedules(structureId, schedules),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules", structureId] });
    },
  });
}
