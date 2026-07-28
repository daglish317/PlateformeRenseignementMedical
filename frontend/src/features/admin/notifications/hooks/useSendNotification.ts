import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationsService } from "../api/notifications.service";
import type { SendNotificationPayload } from "../types/notification";

export function useSendNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendNotificationPayload) => notificationsService.broadcast(data),
    onSuccess: () => {
      toast.success("Notification envoyée à tous les gestionnaires");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-counts"] });
    },
    onError: () => {
      toast.error("Impossible d'envoyer la notification");
    },
  });
}
