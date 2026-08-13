import api from "@/lib/axios";

export interface ProduitPeremption {
  id: string;
  nom: string;
  type: string;
  quantite_actuelle: number;
  date_peremption: string;
  temps_restant: string;
  statut: "PROCHE" | "EXPIRE";
}

export async function getProduitsPeremption(
  structureId: string
): Promise<ProduitPeremption[]> {
  const { data } = await api.get(`/stocks/structure/${structureId}/peremption/`);
  return data;
}
