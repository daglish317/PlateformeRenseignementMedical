import axios from "@/lib/axios";
import type { SearchResponse } from "@/types/search";

export const getEmergencyResults = async (searchTerm: string): Promise<SearchResponse> => {
  const { data } = await axios.get<SearchResponse>("/search/", {
    params: {
      q: searchTerm,
      type: "emergency",
    },
  });

  return data;
};
