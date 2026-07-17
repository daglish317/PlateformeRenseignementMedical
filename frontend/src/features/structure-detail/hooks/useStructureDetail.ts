"use client";

import { useQuery } from "@tanstack/react-query";
import { getStructureDetail } from "../api/structure.service";

export function useStructureDetail(id: string) {
  return useQuery({
    queryKey: ["structure-detail", id],
    queryFn: () => getStructureDetail(id),
    enabled: !!id,
  });
}
