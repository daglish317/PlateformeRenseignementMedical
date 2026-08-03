import { create } from "zustand";
import { devtools } from "zustand/middleware";

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

export const useSearchStore = create<SearchStore>()(
  devtools(
    (set) => ({
      query: "",
      results: null,
      loading: false,
      selectedStructure: null,
      searchMode: "normal",
      page: 1,

      setQuery: (query) => set({ query, searchMode: "normal", page: 1 }, false, "setQuery"),
      setResults: (results) => set({ results }, false, "setResults"),
      setLoading: (loading) => set({ loading }, false, "setLoading"),
      setSelectedStructure: (selectedStructure) => set({ selectedStructure }, false, "setSelectedStructure"),
      setSearchMode: (searchMode) => set({ searchMode }, false, "setSearchMode"),
      setPage: (page) => set({ page }, false, "setPage"),
      clear: () =>
        set(
          {
            query: "",
            results: null,
            loading: false,
            selectedStructure: null,
            searchMode: "normal",
            page: 1,
          },
          false,
          "clear"
        ),
    }),
    { name: "SearchStore", enabled: process.env.NODE_ENV === 'development' }
  )
);

// Sélecteurs optimisés pour éviter les re-renders inutiles
export const useQuery = () => useSearchStore((state) => state.query);
export const useResults = () => useSearchStore((state) => state.results);
export const useLoading = () => useSearchStore((state) => state.loading);
export const useSelectedStructure = () => useSearchStore((state) => state.selectedStructure);
export const useSearchMode = () => useSearchStore((state) => state.searchMode);
export const usePage = () => useSearchStore((state) => state.page);
