"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardPermissionsService } from "../api/permissions.service";
import type { StructurePermissionsResponse } from "../types/permissions";

export const MY_PERMISSIONS_QUERY_KEY = ["structures", "me", "permissions"] as const;

export function useMyPermissions(structureId?: string, enabled = true) {
  return useQuery<StructurePermissionsResponse>({
    queryKey: [...MY_PERMISSIONS_QUERY_KEY, structureId ?? ""],
    queryFn: () => dashboardPermissionsService.getMyPermissions(),
    enabled: Boolean(structureId) && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: false,
  });
}
