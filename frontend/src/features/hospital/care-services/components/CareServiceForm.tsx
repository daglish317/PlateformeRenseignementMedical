"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CatalogueItem } from "../types/care-service";

interface CareServiceFormProps {
  catalogues: CatalogueItem[];
  onSubmit: (catalogueId: string) => void;
  isSubmitting: boolean;
}

export function CareServiceForm({ catalogues, onSubmit, isSubmitting }: CareServiceFormProps) {
  const [selected, setSelected] = useState("");

  const handleSubmit = () => {
    if (!selected) return;
    onSubmit(selected);
    setSelected("");
  };

  return (
    <div className="flex items-end gap-4">
      <div className="flex-1">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Sélectionner une prise en charge</option>
          {catalogues.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nom} ({item.type})
            </option>
          ))}
        </select>
      </div>
      <Button onClick={handleSubmit} disabled={!selected || isSubmitting}>
        <Plus className="mr-2 h-4 w-4" />
        Ajouter
      </Button>
    </div>
  );
}
