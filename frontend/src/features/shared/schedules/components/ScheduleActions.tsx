"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Save, X } from "lucide-react";

interface ScheduleActionsProps {
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function ScheduleActions({
  isEditing,
  onEdit,
  onSave,
  onCancel,
  isSaving,
}: ScheduleActionsProps) {
  if (isEditing) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={isSaving}>
          <X className="h-4 w-4 mr-1" />
          Annuler
        </Button>
        <Button size="sm" onClick={onSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-1" />
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    );
  }

  return (
    <Button size="sm" onClick={onEdit}>
      <Pencil className="h-4 w-4 mr-1" />
      Modifier
    </Button>
  );
}
