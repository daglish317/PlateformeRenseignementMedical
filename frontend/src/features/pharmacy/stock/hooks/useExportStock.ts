"use client";
import { useCallback } from "react";
import { StockItem } from "../types/stock";

export function useExportStock() {
  const exportToCSV = useCallback((items: StockItem[]) => {
    // TODO: implement proper Excel/CSV export
    const headers = ["Nom", "Type", "Quantité", "Seuil alerte", "Disponible"];
    const rows = items.map((item) => [
      item.nom,
      item.type_item,
      item.quantite.toString(),
      item.seuil_alerte.toString(),
      item.disponible ? "Oui" : "Non",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stock_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return { exportToCSV };
}
