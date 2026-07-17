import { create } from "zustand";
import type { SelectedStructure } from "../types/selected-structure";

type StructureSelectionStore = {
  selectedStructure: SelectedStructure | null;
  setSelectedStructure: (structure: SelectedStructure | null) => void;
  clearSelectedStructure: () => void;
};

export const useStructureSelectionStore = create<StructureSelectionStore>((set) => ({
  selectedStructure: null,
  setSelectedStructure: (selectedStructure) => set({ selectedStructure }),
  clearSelectedStructure: () => set({ selectedStructure: null }),
}));
