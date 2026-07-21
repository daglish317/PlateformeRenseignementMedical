import api from "@/lib/axios";
import type { StructureProfile } from "../types/structure-profile";

export const structureProfileService = {
  async getMyStructure(): Promise<StructureProfile> {
    const { data } = await api.get("/structures/me/");
    return data;
  },

  async updateStructure(
    id: string,
    payload: { nom?: string; adresse?: string; telephone?: string }
  ): Promise<StructureProfile> {
    const { data } = await api.patch(`/structures/${id}/`, payload);
    return data;
  },

  async uploadPhoto(id: string, file: File): Promise<StructureProfile> {
    const formData = new FormData();
    formData.append("photo", file);
    const { data } = await api.patch(`/structures/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async deletePhoto(id: string): Promise<StructureProfile> {
    const { data } = await api.patch(`/structures/${id}/`, { photo: null });
    return data;
  },
};
