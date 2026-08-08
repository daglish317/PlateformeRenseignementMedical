"use client";

import { useQuery } from "@tanstack/react-query";
import { ownerStructuresService } from "../api/owner-structures.service";

export const OWNER_STRUCTURES_QUERY_KEY = ["owner", "structures"] as const;

export function useOwnerStructures() {
  return useQuery({
    queryKey: OWNER_STRUCTURES_QUERY_KEY,
    queryFn: ownerStructuresService.list,
    staleTime: 5 * 60 * 1000,
  });
}
