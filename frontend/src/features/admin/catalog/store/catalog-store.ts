import { create } from "zustand";
import type { Catalogue, CatalogueFilters } from "../types/catalog";

interface CatalogState {
  selectedCatalogue: Catalogue | null;
  setSelectedCatalogue: (catalogue: Catalogue | null) => void;
  filters: CatalogueFilters;
  setFilters: (filters: Partial<CatalogueFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: CatalogueFilters = {
  search: "",
  type: "",
  page: 1,
  pageSize: 10,
};

export const useCatalogStore = create<CatalogState>((set) => ({
  selectedCatalogue: null,
  setSelectedCatalogue: (catalogue) => set({ selectedCatalogue: catalogue }),
  filters: defaultFilters,
  setFilters: (partial) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...partial,
        ...(partial.search !== undefined || partial.type !== undefined
          ? { page: 1 }
          : {}),
      },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
