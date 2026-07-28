import api from "@/lib/axios";
import { Schedule, SchedulePayload } from "../types/schedule";

export const schedulesService = {
  getSchedules(structureId: string) {
    return api.get<Schedule[]>(`/structures/${structureId}/horaires/`);
  },

  setSchedules(structureId: string, schedules: SchedulePayload[]) {
    return api.put(`/structures/${structureId}/horaires/set/`, { horaires: schedules });
  },

  updateSchedule(scheduleId: string, payload: Partial<SchedulePayload>) {
    return api.patch(`/structures/horaires/${scheduleId}/`, payload);
  },
};
