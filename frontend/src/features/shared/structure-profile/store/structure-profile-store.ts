import { create } from "zustand";
import type { StructureProfile } from "../types/structure-profile";

interface StructureProfileState {
  structure: StructureProfile | null;
  isEditing: boolean;
  photoPreview: string | null;
  setStructure: (structure: StructureProfile | null) => void;
  setIsEditing: (editing: boolean) => void;
  setPhotoPreview: (preview: string | null) => void;
  reset: () => void;
}

export const useStructureProfileStore = create<StructureProfileState>((set) => ({
  structure: null,
  isEditing: false,
  photoPreview: null,
  setStructure: (structure) => set({ structure }),
  setIsEditing: (isEditing) => set({ isEditing }),
  setPhotoPreview: (photoPreview) => set({ photoPreview }),
  reset: () => set({ structure: null, isEditing: false, photoPreview: null }),
}));
