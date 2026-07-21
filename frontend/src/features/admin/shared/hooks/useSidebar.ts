"use client";

import { create } from "zustand";
import { ADMIN_LAYOUT } from "../constants/layout";

type SidebarState = {
  open: boolean;
  collapsed: boolean;
  isMobile: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  setCollapsed: (collapsed: boolean) => void;
  setIsMobile: (isMobile: boolean) => void;
};

export const useSidebarStore = create<SidebarState>((set, get) => ({
  open: true,
  collapsed: false,
  isMobile: false,
  toggle: () => set({ open: !get().open }),
  setOpen: (open) => set({ open }),
  setCollapsed: (collapsed) => set({ collapsed }),
  setIsMobile: (isMobile) => set({ isMobile, open: !isMobile }),
}));

export function useSidebar() {
  const { open, collapsed, isMobile, toggle, setOpen, setCollapsed, setIsMobile } =
    useSidebarStore();

  const sidebarWidth = collapsed && !isMobile
    ? ADMIN_LAYOUT.sidebarCollapsedWidth
    : ADMIN_LAYOUT.sidebarWidth;

  return {
    open,
    collapsed,
    isMobile,
    sidebarWidth,
    toggle,
    setOpen,
    setCollapsed,
    setIsMobile,
  };
}
