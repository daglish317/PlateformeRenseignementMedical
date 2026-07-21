import api from "@/lib/axios";
import { MedicalService, CatalogueItem } from "../types/service";

export async function getServices(structureId: string): Promise<MedicalService[]> {
  const { data } = await api.get(`/service-medical/structure/${structureId}/`);
  return data;
}

export async function getCatalogues(type?: string): Promise<CatalogueItem[]> {
  const params = type ? { type } : {};
  const { data } = await api.get("/catalogues/", { params });
  return data;
}

export async function createService(
  structureId: string,
  catalogueId: string
): Promise<MedicalService> {
  const { data } = await api.post("/service-medical/create/", {
    structure: structureId,
    catalogue: catalogueId,
  });
  return data;
}

export async function deactivateService(id: string): Promise<void> {
  await api.patch(`/service-medical/${id}/deactivate/`);
}
