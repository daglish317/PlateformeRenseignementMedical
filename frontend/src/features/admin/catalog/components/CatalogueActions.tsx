"use client";

import { Pencil, Trash2, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Catalogue } from "../types/catalog";

interface CatalogueActionsProps {
  catalogue: Catalogue;
  onEdit: (catalogue: Catalogue) => void;
  onDelete: (catalogue: Catalogue) => void;
  onToggle: (catalogue: Catalogue) => void;
}

export function CatalogueActions({
  catalogue,
  onEdit,
  onDelete,
  onToggle,
}: CatalogueActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onEdit(catalogue)}
        title="Modifier"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      {catalogue.est_actif ? (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onToggle(catalogue)}
          title="Désactiver"
          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
        >
          <PowerOff className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onToggle(catalogue)}
          title="Activer"
          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
        >
          <Power className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onDelete(catalogue)}
        title="Supprimer"
        className="text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
