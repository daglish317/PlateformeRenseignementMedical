import api from "@/lib/axios";
import { CareService, CatalogueItem } from "../types/care-service";

export async function getCareServices(
  structureId: string
): Promise<CareService[]> {
  const { data } = await api.get(`/prises-en-charge/structure/${structureId}/`);
  return data;
}

export async function getCatalogues(type?: string): Promise<CatalogueItem[]> {
  const params = type ? { type } : {};
  const { data } = await api.get("/catalogues/", { params });
  return data;
}

export async function createCareService(
  structureId: string,
  catalogueId: string
): Promise<CareService> {
  const { data } = await api.post("/prises-en-charge/create/", {
    structure: structureId,
    catalogue: catalogueId,
  });
  return data;
}

export async function updateCareService(
  id: string,
  payload: Partial<CareService>
): Promise<CareService> {
  const { data } = await api.patch(`/prises-en-charge/${id}/update/`, payload);
  return data;
}

export async function deleteCareService(id: string): Promise<void> {
  await api.delete(`/prises-en-charge/${id}/delete/`);
}
