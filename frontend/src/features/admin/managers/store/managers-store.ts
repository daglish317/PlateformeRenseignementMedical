import { create } from "zustand";
import type { ManagerAdmin, ManagerFilters } from "../types/manager";

interface ManagersState {
  selectedManager: ManagerAdmin | null;
  setSelectedManager: (manager: ManagerAdmin | null) => void;
  filters: ManagerFilters;
  setFilters: (filters: Partial<ManagerFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: ManagerFilters = {
  search: "",
  statut: "",
  type_structure: "",
  page: 1,
  pageSize: 10,
  ordering: "-date_joined",
};

export const useManagersStore = create<ManagersState>((set) => ({
  selectedManager: null,
  setSelectedManager: (manager) => set({ selectedManager: manager }),
  filters: defaultFilters,
  setFilters: (partial) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...partial,
        ...(partial.search !== undefined || partial.statut !== undefined || partial.type_structure !== undefined
          ? { page: 1 }
          : {}),
      },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
