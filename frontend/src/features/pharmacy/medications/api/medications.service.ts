import api from "@/lib/axios";

export interface MedicationDTO {
  id: string;
  structure: string;
  nom: string;
  type_item: string;
  quantite: number;
  disponible: boolean;
  date_ajout: string;
}

export async function getMedications(structureId: string): Promise<MedicationDTO[]> {
  const { data } = await api.get(`/stocks/structure/${structureId}/`);
  return data.filter((item: MedicationDTO) => item.type_item === "MEDICAMENT");
}

export async function importMedications(
  structureId: string,
  file: File
): Promise<{ message: string; imported: number; errors_count: number; errors: Array<{ ligne: number; erreur: string }> }> {
  const formData = new FormData();
  formData.append("structure_id", structureId);
  formData.append("file", file);
  const { data } = await api.post("/stocks/import/medicaments/", formData);
  return data;
}
