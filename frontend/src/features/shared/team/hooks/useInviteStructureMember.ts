"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { teamService } from "../api/team.service";
import type { InviteStructureMemberPayload } from "../types/team";
import { STRUCTURE_TEAM_QUERY_KEY } from "./useStructureTeam";

export function useInviteStructureMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InviteStructureMemberPayload) => teamService.invite(payload),
    onSuccess: (data) => {
      toast.success(
        data.message ||
          "Collaborateur pre-enregistre. Il creera son compte sur la page d'inscription."
      );
      queryClient.invalidateQueries({ queryKey: STRUCTURE_TEAM_QUERY_KEY });
    },
    onError: () => {
      toast.error("Impossible de pre-enregistrer le collaborateur");
    },
  });
}
