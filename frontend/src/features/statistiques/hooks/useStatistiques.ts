"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAnalyseCaisse,
  getAnalyseFinanciere,
  getAnalyseStock,
  getAnalyseVentes,
  getApprovisionnements,
  getComparaison,
  getDetails,
  getProduitsVendus,
  getVueGenerale,
  telechargerStatistiquesExcel,
  telechargerStatistiquesPdf,
} from "../api/statistiques.service";
import { StatistiquesParams } from "../types/statistiques";

export const STATISTIQUES_QUERY_KEY = ["statistiques"] as const;

export function cleParams(params: StatistiquesParams): string {
  return JSON.stringify(params);
}

function extraireDetail(erreur: unknown): string | undefined {
  return (erreur as { response?: { data?: { detail?: string } } })?.response
    ?.data?.detail;
}

export function useVueGenerale(structureId: string, params: StatistiquesParams) {
  return useQuery({
    queryKey: [
      ...STATISTIQUES_QUERY_KEY,
      "generale",
      structureId,
      cleParams(params),
    ],
    queryFn: () => getVueGenerale(structureId, params),
    enabled: Boolean(structureId),
  });
}

export function useAnalyseVentes(structureId: string, params: StatistiquesParams) {
  return useQuery({
    queryKey: [
      ...STATISTIQUES_QUERY_KEY,
      "ventes",
      structureId,
      cleParams(params),
    ],
    queryFn: () => getAnalyseVentes(structureId, params),
    enabled: Boolean(structureId),
  });
}

export function useProduitsVendus(structureId: string, params: StatistiquesParams) {
  return useQuery({
    queryKey: [
      ...STATISTIQUES_QUERY_KEY,
      "produits",
      structureId,
      cleParams(params),
    ],
    queryFn: () => getProduitsVendus(structureId, params),
    enabled: Boolean(structureId),
  });
}

export function useApprovisionnements(
  structureId: string,
  params: StatistiquesParams
) {
  return useQuery({
    queryKey: [
      ...STATISTIQUES_QUERY_KEY,
      "approvisionnements",
      structureId,
      cleParams(params),
    ],
    queryFn: () => getApprovisionnements(structureId, params),
    enabled: Boolean(structureId),
  });
}

export function useAnalyseStock(structureId: string, params: StatistiquesParams) {
  return useQuery({
    queryKey: [
      ...STATISTIQUES_QUERY_KEY,
      "stock",
      structureId,
      cleParams(params),
    ],
    queryFn: () => getAnalyseStock(structureId, params),
    enabled: Boolean(structureId),
  });
}

export function useAnalyseCaisse(structureId: string, params: StatistiquesParams) {
  return useQuery({
    queryKey: [
      ...STATISTIQUES_QUERY_KEY,
      "caisse",
      structureId,
      cleParams(params),
    ],
    queryFn: () => getAnalyseCaisse(structureId, params),
    enabled: Boolean(structureId),
  });
}

export function useAnalyseFinanciere(
  structureId: string,
  params: StatistiquesParams
) {
  return useQuery({
    queryKey: [
      ...STATISTIQUES_QUERY_KEY,
      "financier",
      structureId,
      cleParams(params),
    ],
    queryFn: () => getAnalyseFinanciere(structureId, params),
    enabled: Boolean(structureId),
  });
}

export function useComparaison(
  structureId: string,
  params: StatistiquesParams
) {
  return useQuery({
    queryKey: [
      ...STATISTIQUES_QUERY_KEY,
      "comparaison",
      structureId,
      cleParams(params),
    ],
    queryFn: () => getComparaison(structureId, params),
    enabled: Boolean(structureId),
  });
}

export function useDetails(structureId: string, params: StatistiquesParams) {
  return useQuery({
    queryKey: [
      ...STATISTIQUES_QUERY_KEY,
      "details",
      structureId,
      cleParams(params),
    ],
    queryFn: () => getDetails(structureId, params),
    enabled: Boolean(structureId),
  });
}

export function useTelechargerStatistiques(type: "pdf" | "excel", nomFichier: string) {
  return useMutation({
    mutationFn: (payload: {
      structureId: string;
      params: StatistiquesParams;
    }) =>
      type === "pdf"
        ? telechargerStatistiquesPdf(
            payload.structureId,
            payload.params,
            nomFichier
          )
        : telechargerStatistiquesExcel(
            payload.structureId,
            payload.params,
            nomFichier
          ),
    onError: (erreur: unknown) => {
      toast.error(
        extraireDetail(erreur) ?? "Impossible de télécharger le rapport."
      );
    },
  });
}
