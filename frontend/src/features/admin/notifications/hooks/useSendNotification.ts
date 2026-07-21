import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationsService } from "../api/notifications.service";
import type { SendNotificationPayload } from "../types/notification";

export function useSendNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendNotificationPayload) => notificationsService.send(data),
    onSuccess: (data) => {
      toast.success(data.message || "Notification envoyée avec succès");
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    },
    onError: () => {
      toast.error("Impossible d'envoyer la notification");
    },
  });
}
