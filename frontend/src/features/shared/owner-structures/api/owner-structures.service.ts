import api from "@/lib/axios";
import type {
  CreateOwnerStructurePayload,
  OwnerStructure,
  OwnerStructuresResponse,
  UpdateOwnerStructureStatusPayload,
} from "../types/owner-structure";

export const ownerStructuresService = {
  async list(): Promise<OwnerStructuresResponse> {
    const { data } = await api.get<OwnerStructuresResponse>("/structures/owner/");
    return data;
  },

  async create(payload: CreateOwnerStructurePayload): Promise<{ message: string; data: OwnerStructure }> {
    const { data } = await api.post<{ message: string; data: OwnerStructure }>("/structures/owner/", payload);
    return data;
  },

  async updateStatus(
    payload: UpdateOwnerStructureStatusPayload
  ): Promise<{ message: string; data: OwnerStructure }> {
    const { data } = await api.patch<{ message: string; data: OwnerStructure }>(
      `/structures/owner/${payload.id}/status/`,
      { action: payload.action }
    );
    return data;
  },
};
