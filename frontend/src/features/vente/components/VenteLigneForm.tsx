"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MedicamentVenteCombobox } from "./MedicamentVenteCombobox";
import { formatMontant, MedicamentAvecStock } from "../types/vente";

interface VenteLigneFormProps {
  structureId: string;
  onAdd: (medicament: MedicamentAvecStock, quantite: number) => void;
  adding: boolean;
}

export function VenteLigneForm({ structureId, onAdd, adding }: VenteLigneFormProps) {
  const [medicament, setMedicament] = useState<MedicamentAvecStock | null>(null);
  const [medicamentNom, setMedicamentNom] = useState("");
  const [quantite, setQuantite] = useState("1");

  const quantiteNum = Number(quantite);
  const quantiteValide =
    Number.isInteger(quantiteNum) && quantiteNum > 0 && medicament != null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!medicament) {
      toast.error("Sélectionnez un médicament.");
      return;
    }
    if (!Number.isInteger(quantiteNum) || quantiteNum <= 0) {
      toast.error("La quantité doit être un entier positif.");
      return;
    }
    if (quantiteNum > (medicament.stock_disponible ?? 0)) {
      toast.error(
        `Stock disponible insuffisant (${medicament.stock_disponible} restant(s)).`
      );
      return;
    }
    onAdd(medicament, quantiteNum);
    setMedicament(null);
    setMedicamentNom("");
    setQuantite("1");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="medicament">Médicament</Label>
          <MedicamentVenteCombobox
            structureId={structureId}
            value={medicamentNom}
            onChange={setMedicamentNom}
            onSelect={setMedicament}
          />
        </div>
        <div>
          <Label htmlFor="quantite">Quantité</Label>
          <Input
            id="quantite"
            type="number"
            min={1}
            value={quantite}
            onChange={(e) => setQuantite(e.target.value)}
          />
        </div>
        <div>
          <Label>Montant estimé</Label>
          <p className="flex h-9 items-center rounded-md border bg-muted/40 px-3 text-sm">
            {medicament && medicament.prix_vente != null
              ? formatMontant(medicament.prix_vente * Math.max(quantiteNum, 0))
              : "—"}
          </p>
        </div>
      </div>
      {medicament && (
        <p className="text-xs text-muted-foreground">
          Prix unitaire : {formatMontant(medicament.prix_vente)} · Stock disponible :{" "}
          {medicament.stock_disponible}
        </p>
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={!quantiteValide || adding}>
          Ajouter à la vente
        </Button>
      </div>
    </form>
  );
}
