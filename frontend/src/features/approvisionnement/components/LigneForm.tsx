"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { MedicamentCombobox } from "./MedicamentCombobox";
import { ligneSchema } from "../validation/approvisionnement.schema";
import {
  FORME_PHARMACEUTIQUE_OPTIONS,
  LigneInput,
  Medicament,
} from "../types/approvisionnement";

interface LigneFormProps {
  structureId: string;
  initial?: LigneInput | null;
  onSubmit: (ligne: LigneInput) => void;
  onCancel: () => void;
}

const today = new Date().toISOString().slice(0, 10);

export function LigneForm({
  structureId,
  initial,
  onSubmit,
  onCancel,
}: LigneFormProps) {
  const [nom, setNom] = useState(initial?.nom ?? "");
  const [forme, setForme] = useState(
    initial?.forme_pharmaceutique ?? "COMPRIME"
  );
  const [quantite, setQuantite] = useState(initial?.quantite ?? 1);
  const [prixAchat, setPrixAchat] = useState(
    initial?.prix_achat != null ? String(initial.prix_achat) : ""
  );
  const [prixVente, setPrixVente] = useState(
    initial?.prix_vente != null ? String(initial.prix_vente) : ""
  );
  const [datePeremption, setDatePeremption] = useState(
    initial?.date_peremption ?? ""
  );
  const [tva, setTva] = useState(initial?.tva ?? false);
  const [enReserve, setEnReserve] = useState(initial?.en_reserve ?? false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSelectMedicament = (medicament: Medicament) => {
    setForme(medicament.forme_pharmaceutique);
    setTva(medicament.tva);
    if (medicament.prix_vente != null) {
      setPrixVente(String(medicament.prix_vente));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = ligneSchema.safeParse({
      nom,
      forme_pharmaceutique: forme,
      quantite,
      prix_achat: prixAchat === "" ? undefined : Number(prixAchat),
      prix_vente: prixVente === "" ? null : Number(prixVente),
      date_peremption: datePeremption,
      tva,
      en_reserve: enReserve,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onSubmit({
      nom: nom.trim(),
      forme_pharmaceutique: forme,
      quantite,
      prix_achat: Number(prixAchat),
      prix_vente: prixVente === "" ? null : Number(prixVente),
      date_peremption: datePeremption,
      tva,
      en_reserve: enReserve,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label>Médicament</Label>
          <div className="mt-1">
            <MedicamentCombobox
              structureId={structureId}
              value={nom}
              onChange={(value) => setNom(value)}
              onSelect={handleSelectMedicament}
            />
          </div>
          {errors.nom && (
            <p className="mt-1 text-xs text-destructive">{errors.nom}</p>
          )}
        </div>

        <div>
          <Label>Forme pharmaceutique</Label>
          <div className="mt-1">
            <Select
              value={forme}
              onChange={(e) =>
                setForme(e.target.value as (typeof FORME_PHARMACEUTIQUE_OPTIONS)[number]["value"])
              }
            >
              {FORME_PHARMACEUTIQUE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          {errors.forme_pharmaceutique && (
            <p className="mt-1 text-xs text-destructive">
              {errors.forme_pharmaceutique}
            </p>
          )}
        </div>

        <div>
          <Label>Quantité</Label>
          <Input
            type="number"
            min={1}
            value={quantite}
            onChange={(e) => setQuantite(Number(e.target.value))}
          />
          {errors.quantite && (
            <p className="mt-1 text-xs text-destructive">{errors.quantite}</p>
          )}
        </div>

        <div>
          <Label>Prix d&apos;achat (obligatoire)</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={prixAchat}
            onChange={(e) => setPrixAchat(e.target.value)}
            placeholder="0.00"
          />
          {errors.prix_achat && (
            <p className="mt-1 text-xs text-destructive">{errors.prix_achat}</p>
          )}
        </div>

        <div>
          <Label>Prix de vente</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={prixVente}
            onChange={(e) => setPrixVente(e.target.value)}
            placeholder="0.00"
            disabled={tva}
          />
          {tva && (
            <p className="mt-1 text-xs text-muted-foreground">
              Prix de vente désactivé lorsque la TVA est appliquée.
            </p>
          )}
          {errors.prix_vente && (
            <p className="mt-1 text-xs text-destructive">{errors.prix_vente}</p>
          )}
        </div>

        <div>
          <Label>Date de péremption</Label>
          <Input
            type="date"
            min={today}
            value={datePeremption}
            onChange={(e) => setDatePeremption(e.target.value)}
          />
          {errors.date_peremption && (
            <p className="mt-1 text-xs text-destructive">
              {errors.date_peremption}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="flex gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={tva}
                onChange={(e) => setTva(e.target.checked)}
              />
              Appliquer la TVA
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={enReserve}
                onChange={(e) => setEnReserve(e.target.checked)}
              />
              Mettre en réserve
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {initial ? "Modifier la ligne" : "Ajouter à la livraison"}
        </Button>
      </div>
    </form>
  );
}
