"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  addLigneVente,
  deleteLigneVente,
  updateLigneVente,
} from "../api/vente.service";
import { VENTE_PREPARATION_QUERY_KEY } from "./useVentePreparation";

export function useAjouterLigne(venteId: string, structureId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { medicamentId: string; quantite: number }) =>
      addLigneVente(venteId, payload.medicamentId, payload.quantite),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: VENTE_PREPARATION_QUERY_KEY(structureId),
      });
    },
    onError: (error: unknown) => {
      const detail = (error as { response?: { data?: { detail?: string } } })?.response
        ?.data?.detail;
      toast.error(detail ?? "Impossible d'ajouter le médicament.");
    },
  });
}

export function useModifierLigne(venteId: string, structureId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { ligneId: string; quantite: number }) =>
      updateLigneVente(venteId, payload.ligneId, payload.quantite),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: VENTE_PREPARATION_QUERY_KEY(structureId),
      });
    },
    onError: (error: unknown) => {
      const detail = (error as { response?: { data?: { detail?: string } } })?.response
        ?.data?.detail;
      toast.error(detail ?? "Impossible de modifier la ligne.");
    },
  });
}

export function useSupprimerLigne(venteId: string, structureId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ligneId: string) => deleteLigneVente(venteId, ligneId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: VENTE_PREPARATION_QUERY_KEY(structureId),
      });
    },
    onError: (error: unknown) => {
      const detail = (error as { response?: { data?: { detail?: string } } })?.response
        ?.data?.detail;
      toast.error(detail ?? "Impossible de supprimer la ligne.");
    },
  });
}
