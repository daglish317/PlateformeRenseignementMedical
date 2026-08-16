"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  genererFacture,
  getFactureDetail,
  getFactures,
  getVentesEligibles,
  telechargerFacturePdf,
} from "../api/facture.service";
import type { FactureFiltres } from "../types/facture";

export const FACTURES_QUERY_KEY = ["factures"] as const;
export const FACTURE_DETAIL_QUERY_KEY = (id: string) =>
  ["facture-detail", id] as const;
export const VENTES_ELIGIBLES_QUERY_KEY = ["ventes-eligibles-facture"] as const;

function extraireDetail(erreur: unknown): string | undefined {
  return (erreur as { response?: { data?: { detail?: string } } })?.response
    ?.data?.detail;
}

export function useFactures(structureId: string, filtres: FactureFiltres) {
  const recherche = filtres.recherche?.trim() ?? "";
  const beneficiaire = filtres.beneficiaire?.trim() ?? "";
  const dateDebut = filtres.date_debut ?? "";
  const dateFin = filtres.date_fin ?? "";
  return useQuery({
    queryKey: [
      ...FACTURES_QUERY_KEY,
      structureId,
      recherche,
      beneficiaire,
      dateDebut,
      dateFin,
    ],
    queryFn: () =>
      getFactures(structureId, {
        recherche: recherche || undefined,
        beneficiaire: beneficiaire || undefined,
        date_debut: dateDebut || undefined,
        date_fin: dateFin || undefined,
      }),
    enabled: Boolean(structureId),
  });
}

export function useFactureDetail(id: string | null) {
  return useQuery({
    queryKey: FACTURE_DETAIL_QUERY_KEY(id ?? ""),
    queryFn: () => getFactureDetail(id as string),
    enabled: Boolean(id),
  });
}

export function useVentesEligibles(structureId: string, recherche: string) {
  const terme = recherche.trim();
  return useQuery({
    queryKey: [...VENTES_ELIGIBLES_QUERY_KEY, structureId, terme],
    queryFn: () => getVentesEligibles(structureId, terme || undefined),
    enabled: Boolean(structureId),
  });
}

export function useGenererFacture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ venteId, beneficiaire }: { venteId: string; beneficiaire: string }) =>
      genererFacture(venteId, beneficiaire),
    onSuccess: () => {
      toast.success("Facture générée avec succès.");
      queryClient.invalidateQueries({ queryKey: FACTURES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: VENTES_ELIGIBLES_QUERY_KEY });
    },
    onError: (error: unknown) => {
      toast.error(
        extraireDetail(error) ?? "Impossible de générer la facture."
      );
    },
  });
}

export function useTelechargerFacturePdf() {
  return useMutation({
    mutationFn: (id: string) => telechargerFacturePdf(id),
    onError: (error: unknown) => {
      toast.error(
        extraireDetail(error) ?? "Impossible de télécharger la facture."
      );
    },
  });
}
