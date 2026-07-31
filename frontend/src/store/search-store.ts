import { create } from "zustand";

import type {
  SearchResponse,
  Structure,
} from "@/types/search";

type SearchStore = {
  query: string;
  results: SearchResponse | null;
  loading: boolean;
  selectedStructure: Structure | null;
  searchMode: "normal" | "emergency";
  page: number;

  setQuery: (query: string) => void;
  setResults: (results: SearchResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setSelectedStructure: (structure: Structure | null) => void;
  setSearchMode: (mode: "normal" | "emergency") => void;
  setPage: (page: number) => void;
  clear: () => void;
};

export const useSearchStore = create<SearchStore>((set) => ({
  query: "",
  results: null,
  loading: false,
  selectedStructure: null,
  searchMode: "normal",
  page: 1,

  setQuery: (query) => set({ query, searchMode: "normal", page: 1 }),
  setResults: (results) => set({ results }),
  setLoading: (loading) => set({ loading }),
  setSelectedStructure: (selectedStructure) => set({ selectedStructure }),
  setSearchMode: (searchMode) => set({ searchMode }),
  setPage: (page) => set({ page }),
  clear: () =>
    set({
      query: "",
      results: null,
      loading: false,
      selectedStructure: null,
      searchMode: "normal",
      page: 1,
    }),
}));