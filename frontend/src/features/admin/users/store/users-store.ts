import { create } from "zustand";
import type { UserAdmin, UserFilters } from "../types/user";

interface UsersState {
  selectedUser: UserAdmin | null;
  setSelectedUser: (user: UserAdmin | null) => void;
  filters: UserFilters;
  setFilters: (filters: Partial<UserFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: UserFilters = {
  search: "",
  statut: "",
  page: 1,
  pageSize: 10,
  ordering: "-date_joined",
};

export const useUsersStore = create<UsersState>((set) => ({
  selectedUser: null,
  setSelectedUser: (user) => set({ selectedUser: user }),
  filters: defaultFilters,
  setFilters: (partial) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...partial,
        ...(partial.search !== undefined || partial.statut !== undefined
          ? { page: 1 }
          : {}),
      },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
