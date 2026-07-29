import { create } from "zustand";
import type { Service, ServiceFilters } from "../types/service";

interface ServiceState {
  selectedService: Service | null;
  setSelectedService: (service: Service | null) => void;
  filters: ServiceFilters;
  setFilters: (filters: Partial<ServiceFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: ServiceFilters = {
  search: "",
  type: "",
  page: 1,
  pageSize: 10,
};

export const useServiceStore = create<ServiceState>((set) => ({
  selectedService: null,
  setSelectedService: (service) => set({ selectedService: service }),
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
