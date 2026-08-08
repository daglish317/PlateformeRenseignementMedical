"use client";
import { useQuery } from "@tanstack/react-query";
import { getApprovisionnements } from "../api/approvisionnement.service";

export function useApprovisionnements(structureId: string) {
  return useQuery({
    queryKey: ["approvisionnements", structureId],
    queryFn: () => getApprovisionnements(structureId),
    enabled: !!structureId,
  });
}
