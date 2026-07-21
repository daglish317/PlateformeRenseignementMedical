"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRejectStructure } from "../hooks/useRejectStructure";
import type { StructureAdmin } from "../types/structure";

interface RejectDialogProps {
  structure: StructureAdmin | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RejectDialog({ structure, open, onOpenChange }: RejectDialogProps) {
  const [motif, setMotif] = useState("");
  const rejectMutation = useRejectStructure();

  const handleConfirm = () => {
    if (!structure || !motif.trim()) return;
    rejectMutation.mutate(
      { id: structure.id, motif: motif.trim() },
      {
        onSuccess: () => {
          setMotif("");
          onOpenChange(false);
        },
      }
    );
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setMotif("");
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Refuser la structure</DialogTitle>
          <DialogDescription>
            Veuillez indiquer le motif du refus pour la structure{" "}
            <span className="font-medium text-foreground">{structure?.nom}</span>.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Motif du refus (obligatoire)"
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          rows={4}
          className="mt-2"
        />
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={rejectMutation.isPending}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!motif.trim() || rejectMutation.isPending}
          >
            {rejectMutation.isPending ? "Refus en cours..." : "Refuser"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
