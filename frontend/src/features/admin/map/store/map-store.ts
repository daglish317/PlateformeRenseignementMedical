import { create } from "zustand";
import type { AdminMapStructure } from "../types/map";

interface MapFilters {
  type: string;
  statut: string;
  search: string;
}

interface MapState {
  selectedStructure: AdminMapStructure | null;
  setSelectedStructure: (structure: AdminMapStructure | null) => void;
  filters: MapFilters;
  setFilters: (filters: Partial<MapFilters>) => void;
  resetFilters: () => void;
  mapCenter: [number, number];
  setMapCenter: (center: [number, number]) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
}

const defaultFilters: MapFilters = {
  type: "",
  statut: "",
  search: "",
};

export const useMapStore = create<MapState>((set) => ({
  selectedStructure: null,
  setSelectedStructure: (structure) => set({ selectedStructure: structure }),
  filters: defaultFilters,
  setFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial } })),
  resetFilters: () => set({ filters: defaultFilters }),
  mapCenter: [7.3697, 12.3547],
  setMapCenter: (center) => set({ mapCenter: center }),
  zoom: 6,
  setZoom: (zoom) => set({ zoom }),
}));
