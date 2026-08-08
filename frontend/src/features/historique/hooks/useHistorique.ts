"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getEvenementDetail,
  getEvenements,
  getResumeHistorique,
  telechargerHistoriqueExcel,
  telechargerHistoriquePdf,
} from "../api/historique.service";
import { HistoriqueFiltres } from "../types/historique";

export const HISTORIQUE_QUERY_KEY = ["historique"] as const;
export const HISTORIQUE_RESUME_QUERY_KEY = ["historique-resume"] as const;

function extraireDetail(erreur: unknown): string | undefined {
  return (erreur as { response?: { data?: { detail?: string } } })?.response
    ?.data?.detail;
}

export function useEvenements(
  structureId: string,
  filtres: HistoriqueFiltres
) {
  const recherche = filtres.recherche?.trim() ?? "";
  const type = filtres.type ?? "";
  const periode = filtres.periode ?? "";
  const date_debut = filtres.date_debut ?? "";
  const date_fin = filtres.date_fin ?? "";
  return useQuery({
    queryKey: [
      ...HISTORIQUE_QUERY_KEY,
      structureId,
      recherche,
      type,
      periode,
      date_debut,
      date_fin,
    ],
    queryFn: () => getEvenements(structureId, filtres),
    enabled: Boolean(structureId),
  });
}

export function useResumeHistorique(structureId: string) {
  return useQuery({
    queryKey: [...HISTORIQUE_RESUME_QUERY_KEY, structureId],
    queryFn: () => getResumeHistorique(structureId),
    enabled: Boolean(structureId),
  });
}

export function useEvenementDetail(id: string | null) {
  return useQuery({
    queryKey: ["historique-detail", id ?? ""],
    queryFn: () => getEvenementDetail(id as string),
    enabled: Boolean(id),
  });
}

export function useTelechargerHistorique(
  type: "pdf" | "excel",
  nomFichier: string
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { structureId: string; filtres: HistoriqueFiltres }) =>
      type === "pdf"
        ? telechargerHistoriquePdf(
            payload.structureId,
            payload.filtres,
            nomFichier
          )
        : telechargerHistoriqueExcel(
            payload.structureId,
            payload.filtres,
            nomFichier
          ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HISTORIQUE_QUERY_KEY });
    },
    onError: (erreur: unknown) => {
      toast.error(
        extraireDetail(erreur) ?? "Impossible de télécharger l'export."
      );
    },
  });
}
