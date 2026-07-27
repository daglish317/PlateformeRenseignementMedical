"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export function useMyStructureId() {
  return useQuery({
    queryKey: ["my-structure-id"],
    queryFn: async () => {
      const { data } = await api.get("/structures/me/");
      return data.id as string;
    },
    staleTime: 5 * 60 * 1000,
  });
}
