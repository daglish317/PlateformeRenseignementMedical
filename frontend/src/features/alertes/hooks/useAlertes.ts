"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAlerteDetail,
  getAlertes,
  getResumeAlertes,
  marquerLue,
  telechargerAlertesExcel,
  telechargerAlertesPdf,
} from "../api/alertes.service";
import { AlertesFiltres } from "../types/alerte";

export const ALERTES_QUERY_KEY = ["alertes"] as const;
export const ALERTES_RESUME_QUERY_KEY = ["alertes-resume"] as const;

function extraireDetail(erreur: unknown): string | undefined {
  return (erreur as { response?: { data?: { detail?: string } } })?.response
    ?.data?.detail;
}

export function useAlertes(
  structureId: string,
  filtres: AlertesFiltres
) {
  const recherche = filtres.recherche?.trim() ?? "";
  const filtre = filtres.filtre ?? "";
  const recherche_utilisateur = filtres.recherche_utilisateur?.trim() ?? "";
  return useQuery({
    queryKey: [
      ...ALERTES_QUERY_KEY,
      structureId,
      recherche,
      filtre,
      recherche_utilisateur,
    ],
    queryFn: () => getAlertes(structureId, filtres),
    enabled: Boolean(structureId),
  });
}

export function useResumeAlertes(structureId: string) {
  return useQuery({
    queryKey: [...ALERTES_RESUME_QUERY_KEY, structureId],
    queryFn: () => getResumeAlertes(structureId),
    enabled: Boolean(structureId),
  });
}

export function useAlerteDetail(id: string | null) {
  return useQuery({
    queryKey: ["alerte-detail", id ?? ""],
    queryFn: () => getAlerteDetail(id as string),
    enabled: Boolean(id),
  });
}

export function useMarquerLue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => marquerLue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALERTES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ALERTES_RESUME_QUERY_KEY });
    },
    onError: (erreur: unknown) => {
      toast.error(extraireDetail(erreur) ?? "Impossible de marquer l'alerte comme lue.");
    },
  });
}

export function useTelechargerAlertes(
  type: "pdf" | "excel",
  nomFichier: string
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      structureId: string;
      filtres: AlertesFiltres;
    }) =>
      type === "pdf"
        ? telechargerAlertesPdf(
            payload.structureId,
            payload.filtres,
            nomFichier
          )
        : telechargerAlertesExcel(
            payload.structureId,
            payload.filtres,
            nomFichier
          ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALERTES_QUERY_KEY });
    },
    onError: (erreur: unknown) => {
      toast.error(
        extraireDetail(erreur) ?? "Impossible de télécharger l'export."
      );
    },
  });
}
