"use client";

import { Check, Eye, Power, PowerOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StructureAdmin } from "../types/structure";
import { useUpdateStructureStatus } from "../hooks/useValidateStructure";

interface StructureActionsProps {
  structure: StructureAdmin;
  onView: (structure: StructureAdmin) => void;
  onValidate: (structure: StructureAdmin) => void;
  onReject: (structure: StructureAdmin) => void;
}

export function StructureActions({ structure, onView, onValidate, onReject }: StructureActionsProps) {
  const updateStatusMutation = useUpdateStructureStatus();
  const isActive = structure.statut === "ACTIVE";
  const isSuspended = structure.statut === "SUSPENDUE";
  const isUpdating = updateStatusMutation.isPending && updateStatusMutation.variables?.id === structure.id;

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

      {(isActive || isSuspended) && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() =>
            updateStatusMutation.mutate({
              id: structure.id,
              action: isActive ? "DEACTIVATE" : "ACTIVATE",
            })
          }
          title={isActive ? "Désactiver" : "Activer"}
          className={isActive ? "text-orange-600 hover:bg-orange-50" : "text-emerald-600 hover:bg-emerald-50"}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <span className="h-4 w-4 animate-pulse rounded-full bg-current" />
          ) : isActive ? (
            <PowerOff className="h-4 w-4" />
          ) : (
            <Power className="h-4 w-4" />
          )}
        </Button>
      )}

      {structure.statut === "EN_ATTENTE" && (
        <>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onValidate(structure)}
            title="Valider"
            className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
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
