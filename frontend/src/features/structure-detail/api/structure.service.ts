import axios from "@/lib/axios";
import type { StructureDetail } from "../types/structure-detail";

export const getStructureDetail = async (id: string): Promise<StructureDetail> => {
  const { data } = await axios.get<StructureDetail>(`/api/structures/${id}/`);
  return data;
};
