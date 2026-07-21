import { useMutation, useQueryClient } from "@tanstack/react-query";
import { schedulesService } from "../api/schedules.service";
import { SchedulePayload } from "../types/schedule";

export function useUpdateSchedule(structureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      scheduleId,
      payload,
    }: {
      scheduleId: string;
      payload: Partial<SchedulePayload>;
    }) => schedulesService.updateSchedule(scheduleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules", structureId] });
    },
  });
}
