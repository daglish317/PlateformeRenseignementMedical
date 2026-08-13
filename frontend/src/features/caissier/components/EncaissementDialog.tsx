"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  const handleConfirm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nomClient = String(formData.get("nom_client") ?? "");
    paiementMutation.mutate(
      { venteId: vente.id, mode, nomClient },
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

        <form
          id="encaissement-form"
          onSubmit={handleConfirm}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="beneficiaire">Beneficiaire</Label>
            <Input
              key={vente.id}
              id="beneficiaire"
              name="nom_client"
              defaultValue={vente.nom_client ?? ""}
              placeholder="Nom du beneficiaire"
              disabled={paiementMutation.isPending || Boolean(vente.nom_client)}
            />
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
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={paiementMutation.isPending}
          >
            Retour
          </Button>
          <Button
            type="submit"
            form="encaissement-form"
            disabled={paiementMutation.isPending}
          >
            {paiementMutation.isPending ? "Validation..." : "Valider l'encaissement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
