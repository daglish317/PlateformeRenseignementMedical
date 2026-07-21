"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { StockItem, CreateStockPayload, StockItemType } from "../types/stock";

interface StockFormProps {
  item?: StockItem | null;
  onSubmit: (payload: CreateStockPayload) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function StockForm({ item, onSubmit, onCancel, isSubmitting }: StockFormProps) {
  const [nom, setNom] = useState(item?.nom ?? "");
  const [typeItem, setTypeItem] = useState<StockItemType>(item?.type_item ?? "MEDICAMENT");
  const [quantite, setQuantite] = useState(item?.quantite ?? 0);
  const [seuilAlerte, setSeuilAlerte] = useState(item?.seuil_alerte ?? 0);

  useEffect(() => {
    if (item) {
      setNom(item.nom);
      setTypeItem(item.type_item);
      setQuantite(item.quantite);
      setSeuilAlerte(item.seuil_alerte);
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      nom,
      type_item: typeItem,
      quantite,
      seuil_alerte: seuilAlerte,
      disponible: true,
    });
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
          <label className="text-sm font-medium">Type</label>
          <select
            value={typeItem}
            onChange={(e) => setTypeItem(e.target.value as StockItemType)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm mt-1"
          >
            <option value="MEDICAMENT">Médicament</option>
            <option value="EQUIPEMENT">Équipement</option>
            <option value="CONSOMMABLE">Consommable</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Quantité</label>
          <input
            type="number"
            value={quantite}
            onChange={(e) => setQuantite(Number(e.target.value))}
            min={0}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm mt-1"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Seuil d&apos;alerte</label>
          <input
            type="number"
            value={seuilAlerte}
            onChange={(e) => setSeuilAlerte(Number(e.target.value))}
            min={0}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm mt-1"
            required
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
