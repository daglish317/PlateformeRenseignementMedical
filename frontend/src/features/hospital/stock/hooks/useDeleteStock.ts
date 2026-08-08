"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteStock } from "../api/stock.service";

export function useDeleteStock(structureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteStock(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospital-stock", structureId] });
    },
  });
}
