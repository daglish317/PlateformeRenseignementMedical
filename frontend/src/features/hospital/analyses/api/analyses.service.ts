import api from "@/lib/axios";
import { Analysis, ServiceItem } from "../types/analysis";

export async function getAnalyses(structureId: string): Promise<Analysis[]> {
  const { data } = await api.get(`/analyses/structure/${structureId}/`);
  return data;
}

export async function getServiceItems(type?: string): Promise<ServiceItem[]> {
  const params = type ? { type } : {};
  const { data } = await api.get("/services/", { params });
  return data;
}

export async function createAnalysis(
  structureId: string,
  nom: string
): Promise<Analysis> {
  const { data } = await api.post("/plateau-technique/create/", {
    structure_id: structureId,
    nom,
  });
  return data;
}

export async function deactivateAnalysis(id: string): Promise<void> {
  await api.patch(`/plateau-technique/${id}/deactivate/`);
}

export async function importAnalyses(
  structureId: string,
  file: File
): Promise<{ message: string; imported: number; errors_count: number; errors: Array<{ ligne: number; erreur: string }> }> {
  const formData = new FormData();
  formData.append("structure_id", structureId);
  formData.append("file", file);
  const { data } = await api.post("/analyses/import/", formData);
  return data;
}
