"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { teamService } from "../api/team.service";
import type { UpdateTeamPermissionsPayload } from "../types/team";
import { STRUCTURE_TEAM_QUERY_KEY } from "./useStructureTeam";
import { TEAM_MEMBER_PERMISSIONS_QUERY_KEY } from "./useMemberPermissions";

export function useUpdateTeamPermissions(memberId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateTeamPermissionsPayload) =>
      teamService.updatePermissions(memberId as string, payload),
    onSuccess: (data) => {
      toast.success(data.message || "Permissions mises à jour.");
      queryClient.invalidateQueries({ queryKey: STRUCTURE_TEAM_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...TEAM_MEMBER_PERMISSIONS_QUERY_KEY, memberId ?? ""],
      });
    },
    onError: () => {
      toast.error("Impossible de mettre à jour les permissions.");
    },
  });
}
