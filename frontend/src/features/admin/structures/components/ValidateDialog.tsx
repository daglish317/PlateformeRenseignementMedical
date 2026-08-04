"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useValidateStructure } from "../hooks/useValidateStructure";
import type { StructureAdmin } from "../types/structure";

interface ValidateDialogProps {
  structure: StructureAdmin | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ValidateDialog({ structure, open, onOpenChange }: ValidateDialogProps) {
  const validateMutation = useValidateStructure();

  const handleConfirm = () => {
    if (!structure) return;
    validateMutation.mutate(structure.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Valider la structure</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir valider la structure{" "}
            <span className="font-medium text-foreground">{structure?.nom}</span> ?
            Elle sera rendue visible aux utilisateurs.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={validateMutation.isPending}
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={validateMutation.isPending}
          >
            {validateMutation.isPending ? "Validation..." : "Valider"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
