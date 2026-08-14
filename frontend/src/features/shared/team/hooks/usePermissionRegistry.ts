"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardPermissionsService } from "@/features/shared/dashboard/api/permissions.service";

export const TEAM_PERMISSION_REGISTRY_QUERY_KEY = [
  "structures",
  "team",
  "permission-registry",
] as const;

export function usePermissionRegistry() {
  return useQuery({
    queryKey: TEAM_PERMISSION_REGISTRY_QUERY_KEY,
    queryFn: dashboardPermissionsService.getRegistry,
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
}
