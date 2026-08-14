"use client";

import { useQuery } from "@tanstack/react-query";
import {
  MY_STRUCTURE_QUERY_KEY,
  useMyStructure,
} from "@/features/shared/structure-profile/hooks/useMyStructure";

export function useMyStructureId(enabled = true) {
  const myStructure = useMyStructure(enabled);

  return useQuery({
    queryKey: ["my-structure-id"],
    queryFn: () => Promise.resolve(myStructure.data?.id as string),
    enabled: Boolean(myStructure.data?.id),
    initialData: myStructure.data?.id,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    meta: {
      sourceQueryKey: MY_STRUCTURE_QUERY_KEY,
    },
  });
}
