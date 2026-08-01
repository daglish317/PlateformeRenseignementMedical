"use client";

import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import axios from "@/lib/axios";

import { useSearchStore } from "@/store/search-store";

import type { UnifiedSearchResponse, SearchResponse, SearchResult } from "@/types/search";

type SearchParams = {
  query: string;
  latitude?: number;
  longitude?: number;
  page?: number;
  pageSize?: number;
};

// Fonction pour convertir le nouveau format vers l'ancien pour compatibilité
function convertToLegacyFormat(unifiedResponse: UnifiedSearchResponse): SearchResponse {
  return {
    query: unifiedResponse.query,
    results: unifiedResponse.results.map(result => ({
      structure: result.structure,
      score: result.relevance_score,
      distance_km: result.distance_km,
      service_matches: result.type ? [result.type] : [],
    })),
    suggestions: unifiedResponse.suggestions,
    total: unifiedResponse.total,
    page: 1,
    page_size: 20,
  };
}

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
      // Utiliser le nouveau moteur de recherche intelligent
      const { data } = await axios.get<UnifiedSearchResponse>(
        "/api/search/unified/",
        {
          params: {
            q: query,
            lat: latitude,
            lon: longitude,
            limit: pageSize,
            offset: (page - 1) * pageSize,
          },
        }
      );

      // Convertir au format legacy pour compatibilité avec le reste du frontend
      return convertToLegacyFormat(data);
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

    // Gestion des erreurs réseau
    if (searchQuery.error) {
      setResults({
        query,
        results: [],
        suggestions: [],
        total: 0,
        message: "Erreur de connexion. Veuillez vérifier votre connexion Internet et réessayer.",
      });
    }
  }, [
    query,
    searchQuery.data,
    searchQuery.error,
    setResults,
  ]);

  return searchQuery;
}