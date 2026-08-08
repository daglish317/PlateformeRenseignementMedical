"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { teamService } from "../api/team.service";
import type { UpdateStructureMemberStatusPayload } from "../types/team";
import { STRUCTURE_TEAM_QUERY_KEY } from "./useStructureTeam";

export function useUpdateStructureMemberStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateStructureMemberStatusPayload) =>
      teamService.updateStatus(payload),
    onSuccess: (data) => {
      toast.success(data.message || "Statut du collaborateur mis a jour");
      queryClient.invalidateQueries({ queryKey: STRUCTURE_TEAM_QUERY_KEY });
    },
    onError: () => {
      toast.error("Impossible de modifier le statut du collaborateur");
    },
  });
}
