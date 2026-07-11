"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useDebounce } from "./useDebounce";

const SUGGESTIONS_ENDPOINT = "/api/search/suggestions/";

export type Suggestion = {
  id: string;
  nom: string;
  type: string;
};

type SuggestionsResponse = Suggestion[];

export function useSuggestions(query: string) {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: ["search-suggestions", debouncedQuery],

    queryFn: async () => {
      const { data } = await axios.get<SuggestionsResponse>(
        SUGGESTIONS_ENDPOINT,
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