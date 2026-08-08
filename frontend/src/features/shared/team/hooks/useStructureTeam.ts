"use client";

import { useQuery } from "@tanstack/react-query";
import { teamService } from "../api/team.service";

export const STRUCTURE_TEAM_QUERY_KEY = ["structures", "team"] as const;

export function useStructureTeam(structureId?: string) {
  return useQuery({
    queryKey: [...STRUCTURE_TEAM_QUERY_KEY, structureId],
    queryFn: () => teamService.list(structureId as string),
    enabled: Boolean(structureId),
    staleTime: 5 * 60 * 1000,
  });
}
