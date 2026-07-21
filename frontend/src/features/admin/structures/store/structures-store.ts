import { create } from "zustand";
import type { StructureAdmin, StructureFilters } from "../types/structure";

interface StructuresState {
  selectedStructure: StructureAdmin | null;
  setSelectedStructure: (structure: StructureAdmin | null) => void;
  filters: StructureFilters;
  setFilters: (filters: Partial<StructureFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: StructureFilters = {
  search: "",
  statut: "",
  type: "",
  page: 1,
  pageSize: 10,
  ordering: "-date_creation",
};

export const useStructuresStore = create<StructuresState>((set) => ({
  selectedStructure: null,
  setSelectedStructure: (structure) => set({ selectedStructure: structure }),
  filters: defaultFilters,
  setFilters: (partial) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...partial,
        ...(partial.search !== undefined || partial.statut !== undefined || partial.type !== undefined
          ? { page: 1 }
          : {}),
      },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
