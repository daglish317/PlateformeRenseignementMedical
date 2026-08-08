import api from "@/lib/axios";
import { MedicamentAvecStock, Vente } from "../types/vente";

export async function searchMedicamentsVente(
  structureId: string,
  search: string
): Promise<MedicamentAvecStock[]> {
  const { data } = await api.get("/stocks/medicaments/", {
    params: { structure_id: structureId, search, vendable: true },
  });
  return data;
}

export async function getVentePreparation(
  structureId: string
): Promise<Vente | null> {
  try {
    const { data } = await api.get("/ventes/preparation/", {
      params: { structure_id: structureId },
    });
    return data;
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 404) return null;
    throw error;
  }
}

export async function createVente(structureId: string): Promise<Vente> {
  const { data } = await api.post("/ventes/", { structure_id: structureId });
  return data;
}

export async function addLigneVente(
  venteId: string,
  medicamentId: string,
  quantite: number
): Promise<Vente> {
  const { data } = await api.post(`/ventes/${venteId}/lignes/`, {
    medicament_id: medicamentId,
    quantite,
  });
  return data;
}

export async function updateLigneVente(
  venteId: string,
  ligneId: string,
  quantite: number
): Promise<Vente> {
  const { data } = await api.patch(`/ventes/${venteId}/lignes/${ligneId}/`, {
    quantite,
  });
  return data;
}

export async function deleteLigneVente(
  venteId: string,
  ligneId: string
): Promise<Vente> {
  const { data } = await api.delete(`/ventes/${venteId}/lignes/${ligneId}/supprimer/`);
  return data;
}

export async function envoyerVenteCaisse(venteId: string): Promise<Vente> {
  const { data } = await api.post(`/ventes/${venteId}/envoyer-caisse/`);
  return data.data;
}

export async function annulerVente(
  venteId: string,
  motif?: string
): Promise<Vente> {
  const { data } = await api.post(`/ventes/${venteId}/annuler/`, { motif: motif ?? "" });
  return data.data;
}
