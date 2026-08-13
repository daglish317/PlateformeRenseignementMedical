import api from "@/lib/axios";
import {
  Approvisionnement,
  CreateApprovisionnementPayload,
  Medicament,
} from "../types/approvisionnement";

export async function searchMedicaments(
  structureId: string,
  search: string
): Promise<Medicament[]> {
  const { data } = await api.get("/stocks/medicaments/", {
    params: { structure_id: structureId, search },
  });
  return data;
}

export async function getApprovisionnements(
  structureId: string
): Promise<Approvisionnement[]> {
  const { data } = await api.get("/stocks/approvisionnements/", {
    params: { structure_id: structureId },
  });
  return data;
}

export async function createApprovisionnement(
  structureId: string,
  payload: Omit<CreateApprovisionnementPayload, "structure_id">
): Promise<Approvisionnement> {
  const { data } = await api.post("/stocks/approvisionnements/", {
    ...payload,
    structure_id: structureId,
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

export async function telechargerApprovisionnementPdf(
  approvisionnementId: string
): Promise<void> {
  await telechargerDocument(
    `/stocks/approvisionnements/${approvisionnementId}/export/pdf/`,
    `approvisionnement_${approvisionnementId}.pdf`
  );
}

export async function telechargerApprovisionnementExcel(
  approvisionnementId: string
): Promise<void> {
  await telechargerDocument(
    `/stocks/approvisionnements/${approvisionnementId}/export/excel/`,
    `approvisionnement_${approvisionnementId}.xlsx`
  );
}
