"use client";

import { useQuery } from "@tanstack/react-query";
import { getEmergencyResults } from "../api/emergency.service";
import { useSearchStore } from "@/store/search-store";
import { useEffect } from "react";

export function useEmergencySearch(searchTerm?: string) {
  const setResults = useSearchStore((state) => state.setResults);
  const setLoading = useSearchStore((state) => state.setLoading);
  const searchMode = useSearchStore((state) => state.searchMode);

  const query = useQuery({
    queryKey: ["emergency", searchTerm],
    queryFn: () => getEmergencyResults(searchTerm!),
    enabled: searchMode === "emergency" && !!searchTerm,
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    if (searchMode === "emergency") {
      setLoading(query.isFetching);
    }
  }, [query.isFetching, setLoading, searchMode]);

  useEffect(() => {
    if (searchMode === "emergency" && query.data) {
      setResults(query.data);
    }
  }, [query.data, setResults, searchMode]);

  return {
    results: query.data,
    loading: query.isLoading,
    error: query.error,
  };
}
