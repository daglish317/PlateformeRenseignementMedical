"use client";

import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import axios from "@/lib/axios";

import { useSearchStore } from "@/store/search-store";

import type { SearchResponse } from "@/types/search";

type SearchParams = {
  query: string;
  latitude?: number;
  longitude?: number;
  page?: number;
  pageSize?: number;
};

export function useSearch({
  query,
  latitude,
  longitude,
  page = 1,
  pageSize = 20,
}: SearchParams) {
  const setResults = useSearchStore(
    (state) => state.setResults
  );

  const setLoading = useSearchStore(
    (state) => state.setLoading
  );

  const storePage = useSearchStore(
    (state) => state.page
  );

  const searchQuery = useQuery<SearchResponse>({
    queryKey: [
      "search",
      query,
      latitude,
      longitude,
      page,
      pageSize,
    ],

    enabled: query.trim().length > 0,

    queryFn: async () => {
      const { data } = await axios.get<SearchResponse>(
        "/api/search/",
        {
          params: {
            q: query,
            lat: latitude,
            lon: longitude,
            page,
            page_size: pageSize,
          },
        }
      );

      return data;
    },

    staleTime: 1000 * 60,
  });

  useEffect(() => {
    setLoading(searchQuery.isFetching);
  }, [
    searchQuery.isFetching,
    setLoading,
  ]);

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults(null);
      return;
    }

    if (searchQuery.data) {
      setResults(searchQuery.data);
    }
  }, [
    query,
    searchQuery.data,
    setResults,
  ]);

  return searchQuery;
}