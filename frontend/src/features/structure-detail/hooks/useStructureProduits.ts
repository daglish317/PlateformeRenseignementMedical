"use client";

import { useQuery } from "@tanstack/react-query";
import { getStructureProduits } from "../api/structure.service";

export function useStructureProduits(
  id: string,
  query: string,
  page: number,
  enabled = true
) {
  return useQuery({
    queryKey: ["structure-produits", id, query, page],
    queryFn: () => getStructureProduits({ id, query, page }),
    enabled: !!id && enabled,
    placeholderData: page > 1 ? (previous) => previous : undefined,
  });
}
