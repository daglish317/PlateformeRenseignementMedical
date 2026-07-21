import { useQuery } from "@tanstack/react-query";
import { notificationsService } from "../api/notifications.service";
import { useNotificationsStore } from "../store/notifications-store";

export function useNotifications() {
  const { page, pageSize } = useNotificationsStore();

  return useQuery({
    queryKey: ["admin", "notifications", { page, pageSize }],
    queryFn: () => notificationsService.list({ page, page_size: pageSize }),
    staleTime: 30_000,
  });
}
