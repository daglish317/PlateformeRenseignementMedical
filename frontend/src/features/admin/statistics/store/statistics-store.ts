import { create } from "zustand";

interface StatisticsState {
  period: string;
  setPeriod: (period: string) => void;
}

export const useStatisticsStore = create<StatisticsState>((set) => ({
  period: "30d",
  setPeriod: (period) => set({ period }),
}));
