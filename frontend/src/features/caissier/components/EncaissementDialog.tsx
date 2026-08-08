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
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useValiderPaiement } from "../hooks/useCaisse";
import {
  formatMontant,
  MODES_PAIEMENT,
  ModePaiementValue,
  Vente,
} from "@/features/vente/types/vente";

interface EncaissementDialogProps {
  vente: Vente | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPayed: (vente: Vente) => void;
}

export function EncaissementDialog({
  vente,
  open,
  onOpenChange,
  onPayed,
}: EncaissementDialogProps) {
  const [mode, setMode] = useState<ModePaiementValue>("ESPECES");
  const paiementMutation = useValiderPaiement();

  if (!vente) return null;

  const handleConfirm = () => {
    paiementMutation.mutate(
      { venteId: vente.id, mode },
      {
        onSuccess: (data) => {
          onOpenChange(false);
          setMode("ESPECES");
          onPayed(data.vente);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Encaisser la vente {vente.numero}</DialogTitle>
          <DialogDescription>
            Vérifiez le contenu avant de valider l&apos;encaissement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          {vente.lignes.map((ligne) => (
            <div
              key={ligne.id}
              className="flex items-center justify-between border-b py-1"
            >
              <div>
                <p className="font-medium">{ligne.designation}</p>
                <p className="text-xs text-muted-foreground">
                  {ligne.quantite} × {formatMontant(ligne.prix_unitaire)}
                </p>
              </div>
              <p>{formatMontant(ligne.montant)}</p>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2 text-base font-semibold">
            <span>Total à encaisser</span>
            <span>{formatMontant(vente.montant_total)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mode-paiement">Mode de paiement</Label>
          <Select
            id="mode-paiement"
            value={mode}
            onChange={(e) => setMode(e.target.value as ModePaiementValue)}
          >
            {MODES_PAIEMENT.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={paiementMutation.isPending}
          >
            Retour
          </Button>
          <Button onClick={handleConfirm} disabled={paiementMutation.isPending}>
            {paiementMutation.isPending ? "Validation..." : "Valider l'encaissement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
