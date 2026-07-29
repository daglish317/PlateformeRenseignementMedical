import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { feedbackService } from "../api/feedback.service";

export function useDeleteFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => feedbackService.delete(id),
    onSuccess: () => {
      toast.success("Feedback supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ["admin", "feedbacks"] });
      queryClient.invalidateQueries({ queryKey: ["unread-counts"] });
    },
    onError: () => {
      toast.error("Impossible de supprimer ce feedback");
    },
  });
}
