import { useQuery } from "@tanstack/react-query";
import { statisticsService } from "../api/statistics.service";
import { useStatisticsStore } from "../store/statistics-store";

export function useStatistics() {
  const period = useStatisticsStore((s) => s.period);

  return useQuery({
    queryKey: ["admin", "statistics", period],
    queryFn: () => statisticsService.get(period),
    staleTime: 30_000,
  });
}
