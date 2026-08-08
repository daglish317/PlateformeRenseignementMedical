"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  genererInventaire,
  getInventaireDetail,
  getInventaires,
  InventaireDetailParams,
  telechargerInventaireExcel,
  telechargerInventairePdf,
} from "../api/inventaire.service";

export const INVENTAIRES_QUERY_KEY = ["inventaires"] as const;
export const INVENTAIRE_DETAIL_QUERY_KEY = (id: string) =>
  ["inventaire-detail", id] as const;

function extraireDetail(erreur: unknown): string | undefined {
  return (erreur as { response?: { data?: { detail?: string } } })?.response
    ?.data?.detail;
}

export function useInventaires(structureId: string) {
  return useQuery({
    queryKey: [...INVENTAIRES_QUERY_KEY, structureId],
    queryFn: () => getInventaires(structureId),
    enabled: Boolean(structureId),
  });
}

export function useGenererInventaire() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (structureId: string) => genererInventaire(structureId),
    onSuccess: () => {
      toast.success("Inventaire généré avec succès.");
      queryClient.invalidateQueries({ queryKey: INVENTAIRES_QUERY_KEY });
    },
    onError: (error: unknown) => {
      toast.error(
        extraireDetail(error) ?? "Impossible de générer l'inventaire."
      );
    },
  });
}

export function useInventaireDetail(
  id: string | null,
  params: InventaireDetailParams
) {
  const recherche = params.recherche?.trim() ?? "";
  const statut = params.statut ?? "";
  return useQuery({
    queryKey: [
      ...INVENTAIRE_DETAIL_QUERY_KEY(id ?? ""),
      recherche,
      statut,
    ],
    queryFn: () =>
      getInventaireDetail(id as string, {
        recherche: recherche || undefined,
        statut: statut || undefined,
      }),
    enabled: Boolean(id),
  });
}

export function useTelechargerInventaire(
  type: "pdf" | "excel",
  nomFichier: string
) {
  return useMutation({
    mutationFn: (id: string) =>
      type === "pdf"
        ? telechargerInventairePdf(id, nomFichier)
        : telechargerInventaireExcel(id, nomFichier),
    onError: (error: unknown) => {
      toast.error(
        extraireDetail(error) ??
          "Impossible de télécharger le document."
      );
    },
  });
}
