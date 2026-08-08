"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AnnulationVenteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (motif?: string) => void;
  pending: boolean;
  venteNumero: string;
}

export function AnnulationVenteDialog({
  open,
  onOpenChange,
  onConfirm,
  pending,
  venteNumero,
}: AnnulationVenteDialogProps) {
  const [motif, setMotif] = useState("");

  const handleConfirm = () => {
    onConfirm(motif.trim() || undefined);
    setMotif("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Annuler la vente {venteNumero}</DialogTitle>
          <DialogDescription>
            La vente et son contenu seront supprimés. Cette action est définitive.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="motif">Motif (facultatif)</Label>
          <Input
            id="motif"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Ex : erreur de saisie"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Retour
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending ? "Annulation..." : "Confirmer l'annulation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
