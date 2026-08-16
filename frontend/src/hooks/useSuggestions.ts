"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useDebounce } from "./useDebounce";
import type { PublicSuggestionsResponse, Suggestion } from "@/types/search";

const SUGGESTIONS_ENDPOINT = "/search/public/suggestions/";

export type { Suggestion };

export function useSuggestions(query: string) {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: ["search-public-suggestions", debouncedQuery],

    queryFn: async () => {
      const { data } = await axios.get<PublicSuggestionsResponse>(
        SUGGESTIONS_ENDPOINT,
        {
          params: {
            q: debouncedQuery,
          },
        }
      );

      return data.suggestions;
    },

    enabled: debouncedQuery.trim().length > 0,

    // Cache agressif pour suggestions
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}
