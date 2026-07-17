import { create } from "zustand";

type FavoritesStore = {
  lastUpdated: number;
  triggerUpdate: () => void;
};

export const useFavoritesStore = create<FavoritesStore>((set) => ({
  lastUpdated: Date.now(),
  triggerUpdate: () => set({ lastUpdated: Date.now() }),
}));
