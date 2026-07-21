import api from "@/lib/axios";
import type { DashboardData } from "../types/dashboard";

export const dashboardService = {
  getDashboard: async (): Promise<DashboardData> => {
    const response = await api.get<DashboardData>("/utilisateurs/admin/dashboard/");
    return response.data;
  },
};
