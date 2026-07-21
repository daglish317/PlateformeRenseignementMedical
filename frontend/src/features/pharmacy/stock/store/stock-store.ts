import { create } from "zustand";
import { StockItem, StockItemType } from "../types/stock";

interface StockFilter {
  status: "all" | "available" | "low" | "out";
  type: StockItemType | "all";
}

interface StockState {
  stocks: StockItem[];
  selectedStock: StockItem | null;
  search: string;
  filters: StockFilter;
  page: number;
  pageSize: number;
  setStocks: (stocks: StockItem[]) => void;
  setSelectedStock: (stock: StockItem | null) => void;
  setSearch: (search: string) => void;
  setFilters: (filters: Partial<StockFilter>) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export const useStockStore = create<StockState>((set) => ({
  stocks: [],
  selectedStock: null,
  search: "",
  filters: { status: "all", type: "all" },
  page: 1,
  pageSize: 10,
  setStocks: (stocks) => set({ stocks }),
  setSelectedStock: (selectedStock) => set({ selectedStock }),
  setSearch: (search) => set({ search }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize }),
}));
