import api from "@/lib/axios";
import { Analysis, CatalogueItem } from "../types/analysis";

export async function getAnalyses(structureId: string): Promise<Analysis[]> {
  const { data } = await api.get(`/plateau-technique/structure/${structureId}/`);
  return data;
}

export async function getCatalogues(type?: string): Promise<CatalogueItem[]> {
  const params = type ? { type } : {};
  const { data } = await api.get("/catalogues/", { params });
  return data;
}

export async function createAnalysis(
  structureId: string,
  catalogueId: string
): Promise<Analysis> {
  const { data } = await api.post("/plateau-technique/create/", {
    structure: structureId,
    catalogue: catalogueId,
  });
  return data;
}

export async function deactivateAnalysis(id: string): Promise<void> {
  await api.patch(`/plateau-technique/${id}/deactivate/`);
}
