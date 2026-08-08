"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { annulerVente, envoyerVenteCaisse } from "../api/vente.service";
import { VENTE_PREPARATION_QUERY_KEY } from "./useVentePreparation";

export function useEnvoyerVenteCaisse(venteId: string, structureId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => envoyerVenteCaisse(venteId),
    onSuccess: () => {
      toast.success("Vente envoyée à la caisse.");
      queryClient.invalidateQueries({
        queryKey: VENTE_PREPARATION_QUERY_KEY(structureId),
      });
    },
    onError: (error: unknown) => {
      const detail = (error as { response?: { data?: { detail?: string } } })?.response
        ?.data?.detail;
      toast.error(detail ?? "Impossible d'envoyer la vente à la caisse.");
    },
  });
}

export function useAnnulerVente(venteId: string, structureId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (motif?: string) => annulerVente(venteId, motif),
    onSuccess: () => {
      toast.success("Vente annulée.");
      queryClient.invalidateQueries({
        queryKey: VENTE_PREPARATION_QUERY_KEY(structureId),
      });
    },
    onError: (error: unknown) => {
      const detail = (error as { response?: { data?: { detail?: string } } })?.response
        ?.data?.detail;
      toast.error(detail ?? "Impossible d'annuler la vente.");
    },
  });
}
