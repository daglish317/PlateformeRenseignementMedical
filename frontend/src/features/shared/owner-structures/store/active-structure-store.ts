"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ActiveStructureState {
  activeStructureId: string | null;
  setActiveStructureId: (id: string | null) => void;
}

const PERSIST_KEY = "owner:active-structure-id";

export const useActiveStructureStore = create<ActiveStructureState>()(
  persist(
    (set) => ({
      activeStructureId: null,
      setActiveStructureId: (activeStructureId) => set({ activeStructureId }),
    }),
    {
      name: PERSIST_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);