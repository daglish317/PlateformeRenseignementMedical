import api from "@/lib/axios";
import type {
  Facture,
  FactureFiltres,
  VenteEligible,
} from "../types/facture";

export async function getFactures(
  structureId: string,
  filtres?: FactureFiltres
): Promise<Facture[]> {
  const { data } = await api.get("/ventes/factures/", {
    params: {
      structure_id: structureId,
      recherche: filtres?.recherche?.trim() || undefined,
      beneficiaire: filtres?.beneficiaire?.trim() || undefined,
      date_debut: filtres?.date_debut || undefined,
      date_fin: filtres?.date_fin || undefined,
    },
  });
  return data;
}

export async function getVentesEligibles(
  structureId: string,
  recherche?: string
): Promise<VenteEligible[]> {
  const { data } = await api.get("/ventes/factures/ventes-disponibles/", {
    params: {
      structure_id: structureId,
      recherche: recherche?.trim() || undefined,
    },
  });
  return data;
}

export async function genererFacture(
  venteId: string,
  beneficiaire: string
): Promise<Facture> {
  const { data } = await api.post("/ventes/factures/generer/", {
    vente_id: venteId,
    beneficiaire,
  });
  return data.data as Facture;
}

export async function getFactureDetail(id: string): Promise<Facture> {
  const { data } = await api.get(`/ventes/factures/${id}/`);
  return data;
}

export async function telechargerFacturePdf(id: string): Promise<void> {
  const response = await api.get(`/ventes/factures/${id}/pdf/`, {
    responseType: "blob",
  });
  const disposition = response.headers["content-disposition"] ?? "";
  const match = /filename="?([^"]+)"?/.exec(disposition);
  const nom = match?.[1] ?? `facture_${id}.pdf`;

  const urlObjet = window.URL.createObjectURL(new Blob([response.data]));
  const lien = document.createElement("a");
  lien.href = urlObjet;
  lien.download = nom;
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
  window.URL.revokeObjectURL(urlObjet);
}
