import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { feedbackService } from "../api/feedback.service";

export function useUpdateFeedbackStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "markAsRead" | "markAsTreated" }) =>
      feedbackService[action](id),
    onSuccess: () => {
      toast.success("Statut mis à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ["admin", "feedbacks"] });
    },
    onError: () => {
      toast.error("Impossible de mettre à jour le statut");
    },
  });
}
