import api from "@/lib/axios";
import {
  ModePaiementValue,
  Vente,
  VenteAttente,
} from "@/features/vente/types/vente";
import {
  CreerRetourPayload,
  OperationCaisse,
  RetourCaisse,
} from "../types";

export interface VentesAttenteParams {
  recherche?: string;
  statut?: string;
  structureId?: string;
}

export async function getVentesAttente(
  params: VentesAttenteParams = {}
): Promise<VenteAttente> {
  const { structureId, ...rest } = params;
  const { data } = await api.get("/ventes/caisse/attente/", {
    params: { ...rest, structure_id: structureId || undefined },
  });
  return data;
}

export async function getPaiementsRealises(
  recherche?: string,
  structureId?: string
): Promise<Vente[]> {
  const { data } = await api.get("/ventes/caisse/paiements/", {
    params: {
      recherche: recherche || undefined,
      structure_id: structureId || undefined,
    },
  });
  return data;
}

export async function getRetours(structureId?: string): Promise<RetourCaisse[]> {
  const { data } = await api.get("/ventes/caisse/retours/", {
    params: { structure_id: structureId || undefined },
  });
  return data;
}

export async function creerRetour(
  payload: CreerRetourPayload
): Promise<RetourCaisse> {
  const { data } = await api.post("/ventes/caisse/retours/", payload);
  return data.data;
}

export async function getHistorique(structureId?: string): Promise<OperationCaisse[]> {
  const { data } = await api.get("/ventes/caisse/historique/", {
    params: { structure_id: structureId || undefined },
  });
  return data;
}

export async function telechargerRecuPdf(venteId: string): Promise<void> {
  const response = await api.get(`/ventes/caisse/${venteId}/reception/pdf/`, {
    responseType: "blob",
  });
  const disposition = response.headers["content-disposition"] ?? "";
  const match = /filename="?([^"]+)"?/.exec(disposition);
  const nom = match?.[1] ?? `recu_${venteId}.pdf`;

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = nom;
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
  window.URL.revokeObjectURL(url);
}

export async function validerPaiement(
  venteId: string,
  mode: ModePaiementValue
): Promise<{ message: string; vente: Vente }> {
  const { data } = await api.post(`/ventes/caisse/${venteId}/paiement/`, {
    mode,
  });
  return data;
}

export async function annulerVenteCaisse(
  venteId: string,
  motif?: string
): Promise<Vente> {
  const { data } = await api.post(`/ventes/caisse/${venteId}/annuler/`, {
    motif: motif ?? "",
  });
  return data.data;
}

export async function getFacture(venteId: string): Promise<Vente> {
  const { data } = await api.get(`/ventes/caisse/${venteId}/facture/`);
  return data;
}

export async function imprimerFacture(
  venteId: string
): Promise<{ message: string; total_impressions: number }> {
  const { data } = await api.post(
    `/ventes/caisse/${venteId}/facture/imprimer/`
  );
  return data;
}
