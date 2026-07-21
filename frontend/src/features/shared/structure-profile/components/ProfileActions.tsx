"use client";

import { Pencil, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileActionsProps {
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function ProfileActions({
  isEditing,
  onEdit,
  onSave,
  onCancel,
  isSaving,
}: ProfileActionsProps) {
  if (isEditing) {
    return (
      <div className="flex gap-2">
        <Button onClick={onSave} disabled={isSaving}>
          <Save className="mr-1.5 h-4 w-4" />
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          <X className="mr-1.5 h-4 w-4" />
          Annuler
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" onClick={onEdit}>
      <Pencil className="mr-1.5 h-4 w-4" />
      Modifier
    </Button>
  );
}
