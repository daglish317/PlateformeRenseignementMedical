import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { publicFeedbackService, type SubmitFeedbackPayload } from "../api/public-feedback.service";

export function useSubmitFeedback() {
  return useMutation({
    mutationFn: (data: SubmitFeedbackPayload) => publicFeedbackService.submit(data),
    onSuccess: () => {
      toast.success("Merci pour votre avis !");
    },
    onError: () => {
      toast.error("Impossible d'envoyer votre avis. Veuillez réessayer.");
    },
  });
}
