"use client";
import { useQuery } from "@tanstack/react-query";
import { getStock } from "../api/stock.service";

export function useStock(structureId: string) {
  return useQuery({
    queryKey: ["stock", structureId],
    queryFn: () => getStock(structureId),
    enabled: !!structureId,
  });
}
