import { create } from "zustand";
import type { FeedbackAdmin, FeedbackFilters } from "../types/feedback";

interface FeedbacksState {
  selectedFeedback: FeedbackAdmin | null;
  setSelectedFeedback: (feedback: FeedbackAdmin | null) => void;
  filters: FeedbackFilters;
  setFilters: (filters: Partial<FeedbackFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: FeedbackFilters = {
  search: "",
  statut: "",
  categorie: "",
  page: 1,
  pageSize: 10,
};

export const useFeedbacksStore = create<FeedbacksState>((set) => ({
  selectedFeedback: null,
  setSelectedFeedback: (feedback) => set({ selectedFeedback: feedback }),
  filters: defaultFilters,
  setFilters: (partial) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...partial,
        ...(partial.search !== undefined || partial.statut !== undefined || partial.categorie !== undefined
          ? { page: 1 }
          : {}),
      },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
