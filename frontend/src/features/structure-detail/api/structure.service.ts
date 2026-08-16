import axios from "@/lib/axios";
import type {
  StructureDetail,
  StructureProduitsResponse,
} from "../types/structure-detail";

export const getStructureDetail = async (id: string): Promise<StructureDetail> => {
  const { data } = await axios.get<StructureDetail>(`/structures/${id}/`);
  return data;
};

export const getStructureProduits = async ({
  id,
  query,
  page,
  pageSize = 20,
}: {
  id: string;
  query: string;
  page: number;
  pageSize?: number;
}): Promise<StructureProduitsResponse> => {
  const { data } = await axios.get<StructureProduitsResponse>(
    `/structures/${id}/produits/`,
    {
      params: {
        q: query || undefined,
        page,
        page_size: pageSize,
      },
    }
  );
  return data;
};
