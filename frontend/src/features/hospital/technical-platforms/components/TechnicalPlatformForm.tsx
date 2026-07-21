"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CatalogueItem } from "../types/technical-platform";

interface TechnicalPlatformFormProps {
  catalogues: CatalogueItem[];
  onSubmit: (catalogueId: string) => void;
  isSubmitting: boolean;
}

export function TechnicalPlatformForm({
  catalogues,
  onSubmit,
  isSubmitting,
}: TechnicalPlatformFormProps) {
  const [selectedCatalogue, setSelectedCatalogue] = useState<string>("");

  const handleSubmit = () => {
    if (!selectedCatalogue) return;
    onSubmit(selectedCatalogue);
    setSelectedCatalogue("");
  };

  return (
    <div className="flex items-end gap-4">
      <div className="flex-1">
        <select
          value={selectedCatalogue}
          onChange={(e) => setSelectedCatalogue(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Sélectionner un plateau technique du catalogue</option>
          {catalogues.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nom} ({item.type})
            </option>
          ))}
        </select>
      </div>
      <Button onClick={handleSubmit} disabled={!selectedCatalogue || isSubmitting}>
        <Plus className="mr-2 h-4 w-4" />
        Ajouter
      </Button>
    </div>
  );
}
