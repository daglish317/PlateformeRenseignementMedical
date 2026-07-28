import { useQuery } from "@tanstack/react-query";
import { notificationsService } from "../api/notifications.service";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsService.list(),
    staleTime: 30_000,
  });
}
