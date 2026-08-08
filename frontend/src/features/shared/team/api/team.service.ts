import api from "@/lib/axios";
import type {
  InviteStructureMemberPayload,
  StructureTeamResponse,
  UpdateStructureMemberStatusPayload,
} from "../types/team";

export const teamService = {
  async list(structureId: string): Promise<StructureTeamResponse> {
    const { data } = await api.get<StructureTeamResponse>("/structures/team/", {
      params: { structure_id: structureId },
    });
    return data;
  },

  async invite(payload: InviteStructureMemberPayload): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>("/structures/team/", payload);
    return data;
  },

  async updateStatus(
    payload: UpdateStructureMemberStatusPayload
  ): Promise<{ message: string }> {
    const { data } = await api.patch<{ message: string }>(
      `/structures/team/${payload.memberId}/status/`,
      { action: payload.action }
    );
    return data;
  },
};
