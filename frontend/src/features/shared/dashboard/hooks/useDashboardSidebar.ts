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

export const useDashboardSidebar = create<DashboardSidebarState>((set) => ({
  open: true,
  collapsed: false,
  isMobile: false,
  toggle: () => set((state) => ({ open: !state.open })),
  setOpen: (open) => set({ open }),
  setCollapsed: (collapsed) => set({ collapsed }),
  setIsMobile: (isMobile) => set({ isMobile }),
}));
