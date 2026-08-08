"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ModePaiementValue } from "@/features/vente/types/vente";
import {
  annulerVenteCaisse,
  creerRetour,
  getFacture,
  getHistorique,
  getPaiementsRealises,
  getRetours,
  getVentesAttente,
  imprimerFacture,
  telechargerRecuPdf,
  VentesAttenteParams,
  validerPaiement,
} from "../api/caisse.service";
import { CreerRetourPayload } from "../types";

export const CAISSE_ATTENTE_QUERY_KEY = ["caisse-attente"] as const;
export const CAISSE_PAIEMENTS_QUERY_KEY = ["caisse-paiements"] as const;
export const CAISSE_RETOURS_QUERY_KEY = ["caisse-retours"] as const;
export const CAISSE_HISTORIQUE_QUERY_KEY = ["caisse-historique"] as const;
export const CAISSE_FACTURE_QUERY_KEY = (venteId: string) =>
  ["caisse-facture", venteId] as const;

export function useVentesAttente(params: VentesAttenteParams, enabled = true) {
  return useQuery({
    queryKey: [...CAISSE_ATTENTE_QUERY_KEY, params],
    queryFn: () => getVentesAttente(params),
    enabled,
    staleTime: 15 * 1000,
  });
}

export function usePaiementsRealises(
  recherche: string,
  structureId?: string,
  enabled = true
) {
  return useQuery({
    queryKey: [...CAISSE_PAIEMENTS_QUERY_KEY, recherche, structureId ?? ""],
    queryFn: () => getPaiementsRealises(recherche || undefined, structureId),
    enabled,
  });
}

export function useRetours(structureId?: string, enabled = true) {
  return useQuery({
    queryKey: [...CAISSE_RETOURS_QUERY_KEY, structureId ?? ""],
    queryFn: () => getRetours(structureId),
    enabled,
  });
}

export function useHistorique(structureId?: string, enabled = true) {
  return useQuery({
    queryKey: [...CAISSE_HISTORIQUE_QUERY_KEY, structureId ?? ""],
    queryFn: () => getHistorique(structureId),
    enabled,
  });
}

export function useCreerRetour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreerRetourPayload) => creerRetour(payload),
    onSuccess: () => {
      toast.success("Retour en caisse enregistré.");
      queryClient.invalidateQueries({ queryKey: CAISSE_RETOURS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CAISSE_PAIEMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CAISSE_HISTORIQUE_QUERY_KEY });
    },
    onError: (error: unknown) => {
      const detail = (error as { response?: { data?: { detail?: string } } })?.response
        ?.data?.detail;
      toast.error(detail ?? "Impossible d'enregistrer le retour.");
    },
  });
}

export function useValiderPaiement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { venteId: string; mode: ModePaiementValue }) =>
      validerPaiement(payload.venteId, payload.mode),
    onSuccess: () => {
      toast.success("Paiement validé avec succès.");
      queryClient.invalidateQueries({ queryKey: CAISSE_ATTENTE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CAISSE_PAIEMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CAISSE_HISTORIQUE_QUERY_KEY });
    },
    onError: (error: unknown) => {
      const detail = (error as { response?: { data?: { detail?: string } } })?.response
        ?.data?.detail;
      toast.error(detail ?? "Échec de la validation du paiement.");
    },
  });
}

export function useAnnulerVenteCaisse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { venteId: string; motif?: string }) =>
      annulerVenteCaisse(payload.venteId, payload.motif),
    onSuccess: () => {
      toast.success("Vente annulée.");
      queryClient.invalidateQueries({ queryKey: CAISSE_ATTENTE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CAISSE_HISTORIQUE_QUERY_KEY });
    },
    onError: (error: unknown) => {
      const detail = (error as { response?: { data?: { detail?: string } } })?.response
        ?.data?.detail;
      toast.error(detail ?? "Impossible d'annuler la vente.");
    },
  });
}

export function useFacture(venteId: string | null, enabled = true) {
  return useQuery({
    queryKey: CAISSE_FACTURE_QUERY_KEY(venteId ?? ""),
    queryFn: () => getFacture(venteId as string),
    enabled: !!venteId && enabled,
    retry: false,
  });
}

export function useImprimerFacture(venteId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => imprimerFacture(venteId as string),
    onSuccess: (data) => {
      toast.success(`Impression enregistrée (${data.total_impressions} au total).`);
      if (venteId) {
        queryClient.invalidateQueries({ queryKey: CAISSE_FACTURE_QUERY_KEY(venteId) });
      }
    },
    onError: () => {
      toast.error("Impossible d'enregistrer l'impression.");
    },
  });
}

export function useTelechargerRecu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (venteId: string) => telechargerRecuPdf(venteId),
    onSuccess: (_data, venteId) => {
      queryClient.invalidateQueries({ queryKey: CAISSE_FACTURE_QUERY_KEY(venteId) });
    },
    onError: (error: unknown) => {
      const detail = (error as { response?: { data?: { detail?: string } } })?.response
        ?.data?.detail;
      toast.error(detail ?? "Impossible de télécharger le reçu.");
    },
  });
}
