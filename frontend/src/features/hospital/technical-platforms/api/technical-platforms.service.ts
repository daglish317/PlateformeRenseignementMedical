import api from "@/lib/axios";
import { TechnicalPlatform, ServiceItem } from "../types/technical-platform";

export async function getTechnicalPlatforms(
  structureId: string
): Promise<TechnicalPlatform[]> {
  const { data } = await api.get(`/plateau-technique/structure/${structureId}/`);
  return data;
}

export async function getServices(type?: string): Promise<ServiceItem[]> {
  const params = type ? { type } : {};
  const { data } = await api.get("/services/", { params });
  return data;
}

export async function createTechnicalPlatform(
  structureId: string,
  nom: string
): Promise<TechnicalPlatform> {
  const { data } = await api.post("/plateau-technique/create/", {
    structure_id: structureId,
    nom,
  });
  return data;
}

export async function deactivateTechnicalPlatform(id: string): Promise<void> {
  await api.patch(`/plateau-technique/${id}/deactivate/`);
}

export async function importTechnicalPlatforms(
  structureId: string,
  file: File
): Promise<{ message: string; imported: number; errors_count: number; errors: Array<{ ligne: number; erreur: string }> }> {
  const formData = new FormData();
  formData.append("structure_id", structureId);
  formData.append("file", file);
  const { data } = await api.post("/plateau-technique/import/", formData);
  return data;
}
