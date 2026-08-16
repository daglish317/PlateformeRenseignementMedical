"use client";

import { useQuery } from "@tanstack/react-query";

import api from "@/lib/axios";

export type MyStructure = {
  id: string;
  type: string;
  statut: string;
  [key: string]: unknown;
};

export const MY_STRUCTURE_QUERY_KEY = ["structures", "me"] as const;

export function useMyStructure(enabled = true) {
  return useQuery({
    queryKey: MY_STRUCTURE_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<MyStructure>("/structures/me/");
      return data;
    },
    enabled,
    staleTime: 30 * 1000, // 30 secondes - Plus réactif pour les changements de structure
    gcTime: 30 * 60 * 1000,
    retry: false,
  });
}
