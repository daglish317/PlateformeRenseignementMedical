import api from "@/lib/axios";
import {
  Alerte,
  AlertesFiltres,
  ResumeAlertes,
} from "../types/alerte";

function paramsFiltres(filtres: AlertesFiltres): Record<string, string> {
  const params: Record<string, string> = {};
  if (filtres.recherche?.trim()) params.recherche = filtres.recherche.trim();
  if (filtres.filtre) params.filtre = filtres.filtre;
  if (filtres.recherche_utilisateur?.trim()) {
    params.recherche_utilisateur = filtres.recherche_utilisateur.trim();
  }
  return params;
}

export async function getAlertes(
  structureId: string,
  filtres: AlertesFiltres = {}
): Promise<Alerte[]> {
  const { data } = await api.get("/alertes/", {
    params: { structure_id: structureId, ...paramsFiltres(filtres) },
  });
  return data;
}

export async function getResumeAlertes(
  structureId: string
): Promise<ResumeAlertes> {
  const { data } = await api.get("/alertes/resume/", {
    params: { structure_id: structureId },
  });
  return data;
}

export async function getAlerteDetail(id: string): Promise<Alerte> {
  const { data } = await api.get(`/alertes/${id}/`);
  return data;
}

export async function marquerLue(id: string): Promise<Alerte> {
  const { data } = await api.post(`/alertes/${id}/marquer-lue/`);
  return data;
}

async function telechargerDocument(
  url: string,
  params: Record<string, string>,
  nomFichier: string
): Promise<void> {
  const response = await api.get(url, {
    params,
    responseType: "blob",
  });
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

export async function telechargerAlertesPdf(
  structureId: string,
  filtres: AlertesFiltres,
  nomFichier: string
): Promise<void> {
  await telechargerDocument(
    "/alertes/exporter/pdf/",
    { structure_id: structureId, ...paramsFiltres(filtres) },
    nomFichier
  );
}

export async function telechargerAlertesExcel(
  structureId: string,
  filtres: AlertesFiltres,
  nomFichier: string
): Promise<void> {
  await telechargerDocument(
    "/alertes/exporter/excel/",
    { structure_id: structureId, ...paramsFiltres(filtres) },
    nomFichier
  );
}
