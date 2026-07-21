import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../api/dashboard.service";

export function useDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: dashboardService.getDashboard,
    staleTime: 60_000,
  });
}
