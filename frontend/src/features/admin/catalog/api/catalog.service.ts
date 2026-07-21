import api from "@/lib/axios";
import type { Catalogue } from "../types/catalog";

interface CatalogListResponse {
  results: Catalogue[];
  page: number;
  page_size: number;
  total: number;
}

export const catalogService = {
  list: async (params: Record<string, string | number>): Promise<CatalogListResponse> => {
    const response = await api.get("/catalogues/", { params });
    return response.data;
  },
  detail: async (id: string): Promise<Catalogue> => {
    const response = await api.get(`/catalogues/${id}/`);
    return response.data;
  },
  create: async (data: { nom: string; type: string; description: string }): Promise<Catalogue> => {
    const response = await api.post("/catalogues/create/", data);
    return response.data;
  },
  update: async (id: string, data: Partial<{ nom: string; type: string; description: string }>): Promise<Catalogue> => {
    const response = await api.put(`/catalogues/update/${id}/`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/catalogues/delete/${id}/`);
  },
  activate: async (id: string): Promise<Catalogue> => {
    const response = await api.post(`/catalogues/activate/${id}/`);
    return response.data;
  },
  deactivate: async (id: string): Promise<Catalogue> => {
    const response = await api.post(`/catalogues/deactivate/${id}/`);
    return response.data;
  },
};
