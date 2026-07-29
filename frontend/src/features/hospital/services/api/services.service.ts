import api from "@/lib/axios";
import { MedicalService, ServiceItem } from "../types/service";

export async function getServices(structureId: string): Promise<MedicalService[]> {
  const { data } = await api.get(`/service-medical/structure/${structureId}/`);
  return data;
}

export async function getServiceItems(type?: string): Promise<ServiceItem[]> {
  const params = type ? { type } : {};
  const { data } = await api.get("/services/", { params });
  return data;
}

export async function createService(
  structureId: string,
  nom: string
): Promise<MedicalService> {
  const { data } = await api.post("/service-medical/create/", {
    structure_id: structureId,
    nom,
  });
  return data;
}

export async function deactivateService(id: string): Promise<void> {
  await api.patch(`/service-medical/${id}/deactivate/`);
}

export async function importServices(
  structureId: string,
  file: File
): Promise<{ message: string; imported: number; errors_count: number; errors: Array<{ ligne: number; erreur: string }> }> {
  const formData = new FormData();
  formData.append("structure_id", structureId);
  formData.append("file", file);
  const { data } = await api.post("/service-medical/import/", formData);
  return data;
}
