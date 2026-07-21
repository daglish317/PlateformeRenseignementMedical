"use client";

import { useState } from "react";
import { Eye, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StructureAdmin } from "../types/structure";

interface StructureActionsProps {
  structure: StructureAdmin;
  onView: (structure: StructureAdmin) => void;
  onValidate: (structure: StructureAdmin) => void;
  onReject: (structure: StructureAdmin) => void;
}

export function StructureActions({ structure, onView, onValidate, onReject }: StructureActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onView(structure)}
        title="Voir les détails"
      >
        <Eye className="h-4 w-4" />
      </Button>
      {structure.statut === "EN_ATTENTE" && (
        <>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onValidate(structure)}
            title="Valider"
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onReject(structure)}
            title="Refuser"
            className="text-destructive hover:bg-destructive/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
