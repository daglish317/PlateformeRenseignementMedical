import api from "@/lib/axios";
import { Schedule, SchedulePayload } from "../types/schedule";

export const schedulesService = {
  getSchedules(structureId: string) {
    return api.get<Schedule[]>(`/api/structures/${structureId}/horaires/`);
  },

  setSchedules(structureId: string, schedules: SchedulePayload[]) {
    return api.put(`/api/structures/${structureId}/horaires/set/`, schedules);
  },

  updateSchedule(scheduleId: string, payload: Partial<SchedulePayload>) {
    return api.patch(`/api/structures/horaires/${scheduleId}/`, payload);
  },
};
