import { create } from "zustand";
import { Schedule } from "../types/schedule";

interface SchedulesState {
  schedules: Schedule[];
  editingSchedule: Schedule | null;
  setSchedules: (schedules: Schedule[]) => void;
  setEditingSchedule: (schedule: Schedule | null) => void;
}

export const useSchedulesStore = create<SchedulesState>((set) => ({
  schedules: [],
  editingSchedule: null,
  setSchedules: (schedules) => set({ schedules }),
  setEditingSchedule: (editingSchedule) => set({ editingSchedule }),
}));
