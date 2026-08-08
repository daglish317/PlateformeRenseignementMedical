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
import { useAnnulerVenteCaisse } from "../hooks/useCaisse";
import { Vente } from "@/features/vente/types/vente";

interface AnnulationCaisseDialogProps {
  vente: Vente | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnnulationCaisseDialog({
  vente,
  open,
  onOpenChange,
}: AnnulationCaisseDialogProps) {
  const [motif, setMotif] = useState("");
  const annulationMutation = useAnnulerVenteCaisse();

  if (!vente) return null;

  const handleConfirm = () => {
    annulationMutation.mutate(
      { venteId: vente.id, motif: motif.trim() || undefined },
      {
        onSuccess: () => {
          onOpenChange(false);
          setMotif("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Annuler la vente {vente.numero}</DialogTitle>
          <DialogDescription>
            Les quantités réservées seront libérées et la vente sera annulée.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="motif-caisse">Motif (facultatif)</Label>
          <Input
            id="motif-caisse"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Ex : client absent"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={annulationMutation.isPending}
          >
            Retour
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={annulationMutation.isPending}
          >
            {annulationMutation.isPending ? "Annulation..." : "Confirmer l'annulation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
