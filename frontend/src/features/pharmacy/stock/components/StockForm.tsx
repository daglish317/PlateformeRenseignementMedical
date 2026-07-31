"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StockItem, CreateStockPayload } from "../types/stock";

interface StockFormProps {
  item?: StockItem | null;
  onSubmit: (payload: CreateStockPayload) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function StockForm({ item, onSubmit, onCancel, isSubmitting }: StockFormProps) {
  const [nom, setNom] = useState(item?.nom ?? "");
  const [quantite, setQuantite] = useState(item?.quantite ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ nom, quantite });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Nom</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm mt-1"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Quantité <span className="text-muted-foreground font-normal">(optionnelle)</span></label>
          <input
            type="number"
            value={quantite}
            onChange={(e) => setQuantite(Number(e.target.value))}
            min={0}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm mt-1"
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
        <Button type="submit" disabled={isSubmitting || !nom}>
          {item ? "Modifier" : "Ajouter"}
        </Button>
      </div>
    </form>
  );
}