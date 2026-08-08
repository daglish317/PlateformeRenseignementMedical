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
