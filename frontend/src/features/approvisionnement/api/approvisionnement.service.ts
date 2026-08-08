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
