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

  setQuery: (query: string) => void;

  setResults: (results: SearchResponse | null) => void;

  setLoading: (loading: boolean) => void;

  setSelectedStructure: (
    structure: Structure | null
  ) => void;

  clear: () => void;
};

export const useSearchStore = create<SearchStore>((set) => ({
  query: "",

  results: null,

  loading: false,

  selectedStructure: null,

  setQuery: (query) =>
    set({
      query,
    }),

  setResults: (results) =>
    set({
      results,
    }),

  setLoading: (loading) =>
    set({
      loading,
    }),

  setSelectedStructure: (selectedStructure) =>
    set({
      selectedStructure,
    }),

  clear: () =>
    set({
      query: "",
      results: null,
      loading: false,
      selectedStructure: null,
    }),
}));