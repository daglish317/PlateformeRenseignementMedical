"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useDebounce } from "./useDebounce";
import type { Suggestion } from "@/types/search";

// Nouveau endpoint du moteur de recherche intelligent
const LIVE_SEARCH_ENDPOINT = "/search/live/";

type LiveSearchResponse = Suggestion[];

export type { Suggestion };

export function useSuggestions(query: string) {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: ["search-suggestions", debouncedQuery],

    queryFn: async () => {
      // Utiliser le nouveau endpoint live search
      const { data } = await axios.get<LiveSearchResponse>(
        LIVE_SEARCH_ENDPOINT,
        {
          params: {
            q: debouncedQuery,
          },
        }
      );

      return data;
    },

    enabled: debouncedQuery.trim().length > 0,

    staleTime: 1000 * 60 * 5,
  });
}