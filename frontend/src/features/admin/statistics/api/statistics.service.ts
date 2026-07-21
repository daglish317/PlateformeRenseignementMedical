import api from "@/lib/axios";
import type { StatisticsData } from "../types/statistics";

export const statisticsService = {
  get: async (period: string = "30d"): Promise<StatisticsData> => {
    const response = await api.get("/utilisateurs/admin/statistics/", { params: { period } });
    return response.data;
  },
};
