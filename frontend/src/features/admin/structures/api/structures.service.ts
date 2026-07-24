import api from "@/lib/axios";
import type { StructureAdmin } from "../types/structure";

interface StructuresListResponse {
  results: StructureAdmin[];
  page: number;
  page_size: number;
  total: number;
}

export const structuresService = {
  list: async (params: Record<string, string | number>): Promise<StructuresListResponse> => {
    const response = await api.get("/structures/admin/list/", { params });
    return response.data;
  },

  detail: async (id: string): Promise<StructureAdmin> => {
    const response = await api.get(`/structures/${id}/`);
    return response.data;
  },

  validate: async (id: string): Promise<{ message: string; data: StructureAdmin }> => {
    const response = await api.patch(`/structures/admin/validate/${id}/`, { action: "APPROVE" });
    return response.data;
  },

  reject: async (id: string, motif: string): Promise<{ message: string }> => {
    const response = await api.patch(`/structures/admin/validate/${id}/`, { action: "REJECT", motif });
    return response.data;
  },
};
