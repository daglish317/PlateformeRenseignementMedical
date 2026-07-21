import api from "@/lib/axios";
import { TechnicalPlatform, CatalogueItem } from "../types/technical-platform";

export async function getTechnicalPlatforms(
  structureId: string
): Promise<TechnicalPlatform[]> {
  const { data } = await api.get(`/plateau-technique/structure/${structureId}/`);
  return data;
}

export async function getCatalogues(type?: string): Promise<CatalogueItem[]> {
  const params = type ? { type } : {};
  const { data } = await api.get("/catalogues/", { params });
  return data;
}

export async function createTechnicalPlatform(
  structureId: string,
  catalogueId: string
): Promise<TechnicalPlatform> {
  const { data } = await api.post("/plateau-technique/create/", {
    structure: structureId,
    catalogue: catalogueId,
  });
  return data;
}

export async function deactivateTechnicalPlatform(id: string): Promise<void> {
  await api.patch(`/plateau-technique/${id}/deactivate/`);
}
