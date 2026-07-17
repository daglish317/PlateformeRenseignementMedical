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

  setQuery: (query: string) => void;
  setResults: (results: SearchResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setSelectedStructure: (structure: Structure | null) => void;
  setSearchMode: (mode: "normal" | "emergency") => void;
  clear: () => void;
};

export const useSearchStore = create<SearchStore>((set) => ({
  query: "",
  results: null,
  loading: false,
  selectedStructure: null,
  searchMode: "normal",

  setQuery: (query) => set({ query, searchMode: "normal" }),
  setResults: (results) => set({ results }),
  setLoading: (loading) => set({ loading }),
  setSelectedStructure: (selectedStructure) => set({ selectedStructure }),
  setSearchMode: (searchMode) => set({ searchMode }),
  clear: () =>
    set({
      query: "",
      results: null,
      loading: false,
      selectedStructure: null,
      searchMode: "normal",
    }),
}));