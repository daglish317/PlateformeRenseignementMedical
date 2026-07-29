import api from "@/lib/axios";
import type { Service } from "../types/service";

interface ServiceListResponse {
  results: Service[];
  count: number;
  page: number;
  page_size: number;
  total: number;
}

export const serviceService = {
  list: async (params: Record<string, string | number>): Promise<Service[]> => {
    const response = await api.get("/services/", { params });
    return response.data;
  },
  detail: async (id: string): Promise<Service> => {
    const response = await api.get(`/services/${id}/`);
    return response.data;
  },
  create: async (data: { nom: string; type: string; description: string; categorie?: string }): Promise<Service> => {
    const response = await api.post("/services/create/", data);
    return response.data;
  },
  update: async (id: string, data: Partial<{ nom: string; type: string; description: string; categorie: string }>): Promise<Service> => {
    const response = await api.put(`/services/update/${id}/`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/services/delete/${id}/`);
  },
};
