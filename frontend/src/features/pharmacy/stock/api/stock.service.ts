import api from "@/lib/axios";
import {
  StockItem,
  StockMovement,
  CreateStockPayload,
} from "../types/stock";

export async function getStock(structureId: string): Promise<StockItem[]> {
  const { data } = await api.get(`/stocks/structure/${structureId}/`);
  return data;
}

export async function createStock(payload: CreateStockPayload): Promise<StockItem> {
  const { data } = await api.post("/stocks/create/", payload);
  return data;
}

export async function deleteStock(id: string): Promise<void> {
  await api.delete(`/stocks/${id}/delete/`);
}

export async function addStock(
  id: string,
  quantite: number,
  motif: string
): Promise<void> {
  await api.post(`/stocks/${id}/entree/`, { quantite, motif });
}

export async function removeStock(
  id: string,
  quantite: number,
  motif: string
): Promise<void> {
  await api.post(`/stocks/${id}/retirer/`, { quantite, motif });
}

export async function getMovements(id: string): Promise<StockMovement[]> {
  const { data } = await api.get(`/stocks/${id}/mouvements/`);
  return data;
}

export async function getAlerts(structureId: string): Promise<StockItem[]> {
  const { data } = await api.get(`/stocks/structure/${structureId}/alertes/`);
  return data;
}
