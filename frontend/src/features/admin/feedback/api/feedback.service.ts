import api from "@/lib/axios";
import type { FeedbackAdmin } from "../types/feedback";

interface FeedbackListResponse {
  results: FeedbackAdmin[];
  page: number;
  page_size: number;
  total: number;
}

export const feedbackService = {
  list: async (params: Record<string, string | number>): Promise<FeedbackListResponse> => {
    const response = await api.get("/feedback/admin/list/", { params });
    return response.data;
  },
  stats: async () => {
    const response = await api.get("/feedback/admin/stats/");
    return response.data;
  },
  markAsRead: async (id: string) => {
    const response = await api.patch(`/feedback/admin/${id}/status/`, { statut: "LU" });
    return response.data;
  },
  markAsTreated: async (id: string) => {
    const response = await api.patch(`/feedback/admin/${id}/status/`, { statut: "TRAITE" });
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/feedback/admin/${id}/delete/`);
    return response.data;
  },
};
