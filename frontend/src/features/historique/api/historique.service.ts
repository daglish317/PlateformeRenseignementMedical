import api from "@/lib/axios";
import {
  EvenementHistorique,
  HistoriqueFiltres,
  ResumeHistorique,
} from "../types/historique";

function paramsFiltres(filtres: HistoriqueFiltres): Record<string, string> {
  const params: Record<string, string> = {};
  if (filtres.recherche?.trim()) params.recherche = filtres.recherche.trim();
  if (filtres.type) params.type = filtres.type;
  if (filtres.periode) params.periode = filtres.periode;
  if (filtres.periode === "personnalisee") {
    if (filtres.date_debut) params.date_debut = filtres.date_debut;
    if (filtres.date_fin) params.date_fin = filtres.date_fin;
  }
  return params;
}

export async function getEvenements(
  structureId: string,
  filtres: HistoriqueFiltres = {}
): Promise<EvenementHistorique[]> {
  const { data } = await api.get("/historique/", {
    params: { structure_id: structureId, ...paramsFiltres(filtres) },
  });
  return data;
}

export async function getResumeHistorique(
  structureId: string
): Promise<ResumeHistorique> {
  const { data } = await api.get("/historique/resume/", {
    params: { structure_id: structureId },
  });
  return data;
}

export async function getEvenementDetail(
  id: string
): Promise<EvenementHistorique> {
  const { data } = await api.get(`/historique/${id}/`);
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

export async function telechargerHistoriquePdf(
  structureId: string,
  filtres: HistoriqueFiltres,
  nomFichier: string
): Promise<void> {
  await telechargerDocument(
    "/historique/exporter/pdf/",
    { structure_id: structureId, ...paramsFiltres(filtres) },
    nomFichier
  );
}

export async function telechargerHistoriqueExcel(
  structureId: string,
  filtres: HistoriqueFiltres,
  nomFichier: string
): Promise<void> {
  await telechargerDocument(
    "/historique/exporter/excel/",
    { structure_id: structureId, ...paramsFiltres(filtres) },
    nomFichier
  );
}
