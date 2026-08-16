"use client";

import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import axios from "@/lib/axios";

import { useSearchStore } from "@/store/search-store";

import type { PublicPharmacieResponse } from "@/types/search";

type SearchParams = {
  query: string;
  page?: number;
  pageSize?: number;
};

export function useSearch({
  query,
  page = 1,
  pageSize = 20,
}: SearchParams) {
  const setResults = useSearchStore((state) => state.setResults);
  const appendResults = useSearchStore((state) => state.appendResults);
  const setLoading = useSearchStore((state) => state.setLoading);
  const location = useSearchStore((state) => state.location);

  const searchQuery = useQuery<PublicPharmacieResponse>({
    queryKey: [
      "search-public",
      query,
      location?.latitude,
      location?.longitude,
      page,
      pageSize,
    ],

    enabled: query.trim().length > 0,

    queryFn: async () => {
      const { data } = await axios.get<PublicPharmacieResponse>(
        "/search/public/pharmacies/",
        {
          params: {
            q: query,
            lat: location?.latitude,
            lon: location?.longitude,
            page,
            page_size: pageSize,
          },
        }
      );
      return data;
    },

    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  useEffect(() => {
    setLoading(searchQuery.isFetching);
  }, [searchQuery.isFetching, setLoading]);

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults(null);
      return;
    }

    if (searchQuery.isError) {
      setResults({
        query,
        normalized_query: query.toLowerCase(),
        results: [],
        total: 0,
        page,
        page_size: pageSize,
        has_next: false,
        has_previous: false,
        user_location: null,
      });
      return;
    }

    if (!searchQuery.data) return;

    if (page <= 1) {
      setResults(searchQuery.data);
    } else {
      appendResults(searchQuery.data);
    }
  }, [
    query,
    page,
    pageSize,
    searchQuery.data,
    searchQuery.isError,
    setResults,
    appendResults,
  ]);

  return searchQuery;
}
