"use client";

import { useQuery } from "@tanstack/react-query";
import { structureProfileService } from "../api/structure-profile.service";

export function useStructureProfile() {
  return useQuery({
    queryKey: ["structure-profile"],
    queryFn: structureProfileService.getMyStructure,
    staleTime: 5 * 60 * 1000,
  });
}
