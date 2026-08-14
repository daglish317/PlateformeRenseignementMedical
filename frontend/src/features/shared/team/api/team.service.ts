import api from "@/lib/axios";
import type {
  InviteStructureMemberResponse,
  InviteStructureMemberPayload,
  StructureTeamResponse,
  TeamPermissionsResponse,
  UpdateStructureMemberStatusPayload,
  UpdateTeamPermissionsPayload,
} from "../types/team";

export const teamService = {
  async list(structureId: string): Promise<StructureTeamResponse> {
    const { data } = await api.get<StructureTeamResponse>("/structures/team/", {
      params: { structure_id: structureId },
    });
    return data;
  },

  async invite(payload: InviteStructureMemberPayload): Promise<InviteStructureMemberResponse> {
    const { data } = await api.post<InviteStructureMemberResponse>(
      "/structures/team/",
      payload
    );
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

  async getPermissions(memberId: string): Promise<TeamPermissionsResponse> {
    const { data } = await api.get<TeamPermissionsResponse>(
      `/structures/team/${memberId}/permissions/`
    );
    return data;
  },

  async updatePermissions(
    memberId: string,
    payload: UpdateTeamPermissionsPayload
  ): Promise<TeamPermissionsResponse & { message: string }> {
    const { data } = await api.put<TeamPermissionsResponse & { message: string }>(
      `/structures/team/${memberId}/permissions/`,
      payload
    );
    return data;
  },
};
