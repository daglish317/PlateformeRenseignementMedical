import api from "@/lib/axios";
import type { AdminMapStructure } from "../types/map";

interface StructuresListResponse {
  results: AdminMapStructure[];
  page: number;
  page_size: number;
  total: number;
}

export const mapService = {
  listStructures: async (): Promise<StructuresListResponse> => {
    const response = await api.get<StructuresListResponse>("/structures/admin/list/", {
      params: { page_size: 500 },
    });
    return response.data;
  },
};
