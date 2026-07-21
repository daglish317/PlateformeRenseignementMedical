import { useQuery } from "@tanstack/react-query";
import { feedbackService } from "../api/feedback.service";
import type { FeedbackFilters } from "../types/feedback";

export function useFeedbacks(filters: FeedbackFilters) {
  const params: Record<string, string | number> = {
    page: filters.page,
    page_size: filters.pageSize,
  };

  if (filters.search) params.search = filters.search;
  if (filters.statut) params.statut = filters.statut;
  if (filters.categorie) params.categorie = filters.categorie;

  return useQuery({
    queryKey: ["admin", "feedbacks", filters],
    queryFn: () => feedbackService.list(params),
    staleTime: 30_000,
  });
}
