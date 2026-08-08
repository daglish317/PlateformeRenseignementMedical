import api from "@/lib/axios";
import { Inventaire } from "../types/inventaire";

export interface InventaireDetailParams {
  recherche?: string;
  statut?: string;
}

export async function getInventaires(
  structureId: string
): Promise<Inventaire[]> {
  const { data } = await api.get("/inventaires/", {
    params: { structure_id: structureId },
  });
  return data;
}

export async function genererInventaire(
  structureId: string
): Promise<Inventaire> {
  const { data } = await api.post("/inventaires/generer/", {
    structure_id: structureId,
  });
  return data;
}

export async function getInventaireDetail(
  id: string,
  params?: InventaireDetailParams
): Promise<Inventaire> {
  const { data } = await api.get(`/inventaires/${id}/`, {
    params,
  });
  return data;
}

async function telechargerDocument(
  url: string,
  nomFichier: string
): Promise<void> {
  const response = await api.get(url, { responseType: "blob" });
  const disposition = response.headers["content-disposition"] ?? "";
  const match = /filename="?([^"]+)"?/.exec(disposition);
  const nom = match?.[1] ?? nomFichier;

  const urlObjet = window.URL.createObjectURL(new Blob([response.data]));
  const lien = document.createElement("a");
  lien.href = urlObjet;
  lien.download = nom;
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
  window.URL.revokeObjectURL(urlObjet);
}

export async function telechargerInventairePdf(
  id: string,
  nomFichier: string
): Promise<void> {
  await telechargerDocument(`/inventaires/${id}/pdf/`, nomFichier);
}

export async function telechargerInventaireExcel(
  id: string,
  nomFichier: string
): Promise<void> {
  await telechargerDocument(`/inventaires/${id}/excel/`, nomFichier);
}
