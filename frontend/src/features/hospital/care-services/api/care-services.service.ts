import api from "@/lib/axios";
import { CareService, ServiceItem } from "../types/care-service";

export async function getCareServices(
  structureId: string
): Promise<CareService[]> {
  const { data } = await api.get(`/prises-en-charge/structure/${structureId}/`);
  return data;
}

export async function getServiceItems(type?: string): Promise<ServiceItem[]> {
  const params = type ? { type } : {};
  const { data } = await api.get("/services/", { params });
  return data;
}

export async function createCareService(
  structureId: string,
  nom: string
): Promise<CareService> {
  const { data } = await api.post("/prises-en-charge/create/", {
    structure_id: structureId,
    nom,
  });
  return data;
}

export async function updateCareService(
  id: string,
  payload: Partial<{ niveau: string }>
): Promise<CareService> {
  const { data } = await api.patch(`/prises-en-charge/${id}/update/`, payload);
  return data;
}

export async function deleteCareService(id: string): Promise<void> {
  await api.delete(`/prises-en-charge/${id}/delete/`);
}

export async function importCareServices(
  structureId: string,
  file: File
): Promise<{ message: string; imported: number; errors_count: number; errors: Array<{ ligne: number; erreur: string }> }> {
  const formData = new FormData();
  formData.append("structure_id", structureId);
  formData.append("file", file);
  const { data } = await api.post("/prises-en-charge/import/", formData);
  return data;
}
