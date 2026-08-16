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
      // Adaptation au format du moteur public (les résultats d'urgence
      // restent compatibles avec la carte de résultat partagée).
      setResults({
        query: query.data.query ?? "",
        normalized_query: query.data.query.toLowerCase(),
        results: query.data.results.map((r) => ({
          id: r.structure.id,
          produit: { nom: r.structure.nom, quantite: 0 },
          structure: r.structure,
          est_ouverte: false,
          distance_km: r.distance_km,
          temps_marche_min: null,
          temps_voiture_min: null,
        })),
        total: query.data.total,
        page: query.data.page ?? 1,
        page_size: query.data.page_size ?? 20,
        has_next: false,
        has_previous: false,
        user_location: null,
      });
    }
  }, [query.data, setResults, searchMode]);

  return {
    results: query.data,
    loading: query.isLoading,
    error: query.error,
  };
}
