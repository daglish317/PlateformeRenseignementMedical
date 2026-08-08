"use client";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { StockItem } from "../types/stock";
import { StockStatusBadge } from "./StockStatusBadge";

interface StockTableProps {
  items: StockItem[];
  onEdit?: (item: StockItem) => void;
  onDelete: (item: StockItem) => void;
}

export function StockTable({ items, onEdit, onDelete }: StockTableProps) {
  if (items.length === 0) {
    return <p className="text-muted-foreground p-4">Aucun article en stock.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="p-3 font-medium">Nom</th>
            <th className="p-3 font-medium">Type</th>
            <th className="p-3 font-medium">Quantité</th>
            <th className="p-3 font-medium">Seuil alerte</th>
            <th className="p-3 font-medium">Statut</th>
            <th className="p-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-3 font-medium">{item.nom}</td>
              <td className="p-3">{item.type_item}</td>
              <td className="p-3">{item.quantite}</td>
              <td className="p-3">{item.seuil_alerte}</td>
              <td className="p-3">
                <StockStatusBadge
                  quantite={item.quantite}
                  seuilAlerte={item.seuil_alerte}
                  disponible={item.disponible}
                />
              </td>
              <td className="p-3 text-right space-x-1">
                {onEdit && (
                  <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => onDelete(item)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
