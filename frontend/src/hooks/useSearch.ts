"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

export type Structure = {
  id: string;
  nom: string;
  type: string;
  adresse: string;
  telephone: string;
  latitude: number;
  longitude: number;
};

export type SearchResult = {
  structure: Structure;
  score: number;
  distance_km: number | null;
  services_matches: string[];
};

export type Catalogue = {
  id: string;
  nom: string;
  type: string;
};

export type SearchResponse = {
  query: string;
  catalogue: Catalogue | null;
  results: SearchResult[];
  suggestions: {
    id: string;
    nom: string;
    type: string;
  }[];
  total: number;
  page: number;
  page_size: number;
  message?: string;
};

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
  return useQuery({
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
}