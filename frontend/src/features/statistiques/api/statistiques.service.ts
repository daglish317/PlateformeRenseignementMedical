import api from "@/lib/axios";
import {
  AnalyseCaisse,
  AnalyseFinanciere,
  AnalyseStock,
  AnalyseVentes,
  Approvisionnements,
  Comparaison,
  Details,
  ProduitsVendus,
  StatistiquesParams,
  VueGenerale,
} from "../types/statistiques";

export function construireParamsAPI(
  structureId: string,
  params: StatistiquesParams
): Record<string, string> {
  const query: Record<string, string> = { structure_id: structureId };
  if (params.periode) query.periode = params.periode;
  if (params.date_debut) query.date_debut = params.date_debut;
  if (params.date_fin) query.date_fin = params.date_fin;
  if (params.produit?.trim()) query.produit = params.produit.trim();
  if (params.type) query.type = params.type;
  if (params.vente?.trim()) query.vente = params.vente.trim();
  if (params.approvisionnement?.trim()) {
    query.approvisionnement = params.approvisionnement.trim();
  }
  if (params.caisse) query.caisse = params.caisse;
  return query;
}

export async function getVueGenerale(
  structureId: string,
  params: StatistiquesParams
): Promise<VueGenerale> {
  const { data } = await api.get("/statistiques/generale/", {
    params: construireParamsAPI(structureId, params),
  });
  return data;
}

export async function getAnalyseVentes(
  structureId: string,
  params: StatistiquesParams
): Promise<AnalyseVentes> {
  const { data } = await api.get("/statistiques/ventes/", {
    params: construireParamsAPI(structureId, params),
  });
  return data;
}

export async function getProduitsVendus(
  structureId: string,
  params: StatistiquesParams
): Promise<ProduitsVendus> {
  const { data } = await api.get("/statistiques/produits/", {
    params: construireParamsAPI(structureId, params),
  });
  return data;
}

export async function getApprovisionnements(
  structureId: string,
  params: StatistiquesParams
): Promise<Approvisionnements> {
  const { data } = await api.get("/statistiques/approvisionnements/", {
    params: construireParamsAPI(structureId, params),
  });
  return data;
}

export async function getAnalyseStock(
  structureId: string,
  params: StatistiquesParams
): Promise<AnalyseStock> {
  const { data } = await api.get("/statistiques/stock/", {
    params: construireParamsAPI(structureId, params),
  });
  return data;
}

export async function getAnalyseCaisse(
  structureId: string,
  params: StatistiquesParams
): Promise<AnalyseCaisse> {
  const { data } = await api.get("/statistiques/caisse/", {
    params: construireParamsAPI(structureId, params),
  });
  return data;
}

export async function getAnalyseFinanciere(
  structureId: string,
  params: StatistiquesParams
): Promise<AnalyseFinanciere> {
  const { data } = await api.get("/statistiques/financier/", {
    params: construireParamsAPI(structureId, params),
  });
  return data;
}

export async function getComparaison(
  structureId: string,
  params: StatistiquesParams
): Promise<Comparaison> {
  const { data } = await api.get("/statistiques/comparaison/", {
    params: construireParamsAPI(structureId, params),
  });
  return data;
}

export async function getDetails(
  structureId: string,
  params: StatistiquesParams
): Promise<Details> {
  const { data } = await api.get("/statistiques/details/", {
    params: construireParamsAPI(structureId, params),
  });
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

export async function telechargerStatistiquesPdf(
  structureId: string,
  params: StatistiquesParams,
  nomFichier: string
): Promise<void> {
  await telechargerDocument(
    "/statistiques/exporter/pdf/",
    construireParamsAPI(structureId, params),
    nomFichier
  );
}

export async function telechargerStatistiquesExcel(
  structureId: string,
  params: StatistiquesParams,
  nomFichier: string
): Promise<void> {
  await telechargerDocument(
    "/statistiques/exporter/excel/",
    construireParamsAPI(structureId, params),
    nomFichier
  );
}
