"use client";

import { useQuery } from "@tanstack/react-query";
import { teamService } from "../api/team.service";

export const TEAM_MEMBER_PERMISSIONS_QUERY_KEY = [
  "structures",
  "team",
  "permissions",
] as const;

export function useMemberPermissions(memberId?: string) {
  return useQuery({
    queryKey: [...TEAM_MEMBER_PERMISSIONS_QUERY_KEY, memberId ?? ""],
    queryFn: () => teamService.getPermissions(memberId as string),
    enabled: Boolean(memberId),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
