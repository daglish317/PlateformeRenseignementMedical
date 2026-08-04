import { create } from "zustand";

interface DashboardSidebarState {
  open: boolean;
  collapsed: boolean;
  isMobile: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  setCollapsed: (collapsed: boolean) => void;
  setIsMobile: (isMobile: boolean) => void;
}

export const useDashboardSidebar = create<DashboardSidebarState>((set, get) => ({
  open: true,
  collapsed: false,
  isMobile: false,
  toggle: () => set((state) => ({ open: !state.open })),
  setOpen: (open) => {
    if (get().open !== open) {
      set({ open });
    }
  },
  setCollapsed: (collapsed) => {
    if (get().collapsed !== collapsed) {
      set({ collapsed });
    }
  },
  setIsMobile: (isMobile) => {
    if (get().isMobile !== isMobile) {
      set({ isMobile });
    }
  },
}));
