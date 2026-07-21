import api from "@/lib/axios";
import type { StructureInfo, DashboardHomeData } from "../types/dashboard-home";

export const dashboardHomeService = {
  async getMyStructure(): Promise<StructureInfo> {
    const { data } = await api.get("/structures/me/");
    return data;
  },

  async getStructureStats(
    structureId: string
  ): Promise<DashboardHomeData["stats"]> {
    const [services, analyses, platforms, careServices, stock] =
      await Promise.allSettled([
        api.get(`/service-medical/structure/${structureId}/`),
        api.get(`/analyses/structure/${structureId}/`),
        api.get(`/plateau-technique/structure/${structureId}/`),
        api.get(`/prises-en-charge/structure/${structureId}/`),
        api.get(`/stocks/structure/${structureId}/`),
      ]);

    const extractCount = (
      result: PromiseSettledResult<{ data: { results?: unknown[] } | unknown[] }>
    ): number => {
      if (result.status !== "fulfilled") return 0;
      const d = result.value.data;
      if (Array.isArray(d)) return d.length;
      if (d && typeof d === "object" && "results" in d)
        return (d as { results?: unknown[] }).results?.length ?? 0;
      return 0;
    };

    return {
      services_count: extractCount(services),
      analyses_count: extractCount(analyses),
      technical_platforms_count: extractCount(platforms),
      care_services_count: extractCount(careServices),
      stock_items_count: extractCount(stock),
    };
  },
};
