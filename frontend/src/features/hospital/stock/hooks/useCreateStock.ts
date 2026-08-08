"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStock } from "../api/stock.service";
import { CreateStockPayload } from "../types/stock";

export function useCreateStock(structureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStockPayload) => createStock(structureId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospital-stock", structureId] });
    },
  });
}
