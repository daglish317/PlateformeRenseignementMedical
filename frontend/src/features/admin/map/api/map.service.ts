import api from "@/lib/axios";
import type { AdminMapStructure } from "../types/map";

interface StructuresListResponse {
  results: AdminMapStructure[];
  page: number;
  page_size: number;
  total: number;
}

// Le backend plafonne page_size à 100 : on boucle sur toutes les pages pour
// récupérer l'ensemble des structures, sans exception.
const PAGE_SIZE = 100;

export const mapService = {
  listStructures: async (): Promise<AdminMapStructure[]> => {
    const structures: AdminMapStructure[] = [];
    let page = 1;

    while (true) {
      const response = await api.get<StructuresListResponse>("/structures/admin/list/", {
        params: { page, page_size: PAGE_SIZE },
      });

      const { results, total } = response.data;
      structures.push(...results);

      if (structures.length >= total || results.length === 0) break;
      page += 1;
    }

    return structures;
  },
};
