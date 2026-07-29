"use client";
import { useQuery } from "@tanstack/react-query";
import { getMedications } from "../api/medications.service";

export function useMedications(structureId: string) {
  return useQuery({
    queryKey: ["medications", structureId],
    queryFn: () => getMedications(structureId),
    enabled: !!structureId,
  });
}
