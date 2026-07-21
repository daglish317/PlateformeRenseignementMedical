"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardHomeService } from "../api/dashboard-home.service";

export function useDashboardHome() {
  return useQuery({
    queryKey: ["dashboard-home"],
    queryFn: async () => {
      const structure = await dashboardHomeService.getMyStructure();
      const stats = await dashboardHomeService.getStructureStats(structure.id);
      return { structure, stats };
    },
    staleTime: 5 * 60 * 1000,
  });
}
