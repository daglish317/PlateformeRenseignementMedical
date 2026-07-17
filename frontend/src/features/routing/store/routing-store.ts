import { create } from "zustand";
import type { Route } from "../types/route";

type RoutingStore = {
  currentRoute: Route | null;
  setCurrentRoute: (route: Route | null) => void;
  clearRoute: () => void;
};

export const useRoutingStore = create<RoutingStore>((set) => ({
  currentRoute: null,
  setCurrentRoute: (currentRoute) => set({ currentRoute }),
  clearRoute: () => set({ currentRoute: null }),
}));
