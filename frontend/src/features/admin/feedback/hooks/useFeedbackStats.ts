import { useQuery } from "@tanstack/react-query";
import { feedbackService } from "../api/feedback.service";

export function useFeedbackStats() {
  return useQuery({
    queryKey: ["admin", "feedbacks", "stats"],
    queryFn: () => feedbackService.stats(),
    staleTime: 30_000,
  });
}
