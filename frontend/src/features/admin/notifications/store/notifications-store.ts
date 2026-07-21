import { create } from "zustand";

interface NotificationsState {
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  page: 1,
  setPage: (page) => set({ page }),
  pageSize: 10,
}));
