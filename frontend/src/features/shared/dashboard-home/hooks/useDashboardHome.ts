"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardHomeService } from "../api/dashboard-home.service";
import type { DashboardHomeData } from "../types/dashboard-home";

export function useDashboardHome() {
  return useQuery<DashboardHomeData>({
    queryKey: ["dashboard-home"],
    queryFn: async () => {
      const structure = await dashboardHomeService.getMyStructure();
      const stats = await dashboardHomeService.getStructureStats(structure.id);
      return { structure, stats, recent_activity: [] };
    },
    staleTime: 5 * 60 * 1000,
  });
}
