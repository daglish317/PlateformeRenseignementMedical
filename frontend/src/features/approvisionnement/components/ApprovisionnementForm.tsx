"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LigneForm } from "./LigneForm";
import { LignesTable } from "./LignesTable";
import { useApprovisionnementStore } from "../store/approvisionnement-store";
import { useCreateApprovisionnement } from "../hooks/useCreateApprovisionnement";
import { LigneInput } from "../types/approvisionnement";

interface ApprovisionnementFormProps {
  structureId: string;
}

export function ApprovisionnementForm({ structureId }: ApprovisionnementFormProps) {
  const {
    dateReception,
    fournisseur,
    referenceBon,
    montantTotalDeclare,
    lignes,
    setDateReception,
    setFournisseur,
    setReferenceBon,
    setMontantTotalDeclare,
    addLigne,
    updateLigne,
    removeLigne,
    reset,
  } = useApprovisionnementStore();

  const createMutation = useCreateApprovisionnement(structureId);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [addCounter, setAddCounter] = useState(0);

  const montantDeclareNombre = montantTotalDeclare === "" ? null : Number(montantTotalDeclare);
  const montantCalcule = useMemo(
    () => lignes.reduce((total, ligne) => total + ligne.prix_achat * ligne.quantite, 0),
    [lignes]
  );
  const ecartMontant =
    montantDeclareNombre == null ? null : Number((montantDeclareNombre - montantCalcule).toFixed(2));
  const montantCorrespond =
    montantDeclareNombre != null && Number(montantCalcule.toFixed(2)) === montantDeclareNombre;

  const handleSubmitLigne = (ligne: LigneInput) => {
    if (editingIndex != null) {
      updateLigne(editingIndex, ligne);
      toast.success("Ligne modifiee");
      setEditingIndex(null);
    } else {
      addLigne(ligne);
      toast.success("Medicament ajoute a la livraison");
      setAddCounter((counter) => counter + 1);
    }
  };

  const handleEdit = (index: number) => setEditingIndex(index);

  const handleDelete = (index: number) => {
    removeLigne(index);
    if (editingIndex === index) setEditingIndex(null);
    toast.success("Ligne supprimee");
  };

  const handleSave = () => {
    if (lignes.length === 0) {
      toast.error("Ajoutez au moins un medicament avant d'enregistrer.");
      return;
    }
    if (!dateReception) {
      toast.error("La date d'approvisionnement est obligatoire.");
      return;
    }
    if (!referenceBon.trim()) {
      toast.error("Le numero du bon de livraison est obligatoire.");
      return;
    }
    if (montantDeclareNombre == null || Number.isNaN(montantDeclareNombre) || montantDeclareNombre <= 0) {
      toast.error("Le montant total indique sur le bon est obligatoire.");
      return;
    }
    if (!montantCorrespond) {
      toast.error("Le montant declare ne correspond pas au montant calcule des lignes.");
      return;
    }

    createMutation.mutate(
      {
        date_reception: dateReception,
        fournisseur,
        reference_bon: referenceBon.trim(),
        montant_total_declare: montantDeclareNombre,
        lignes,
      },
      {
        onSuccess: () => {
          toast.success("Approvisionnement enregistre avec succes");
          setEditingIndex(null);
          reset();
        },
        onError: (error: unknown) => {
          const err = error as {
            response?: {
              data?: {
                detail?: string;
                errors?: Array<{ index: number; erreur: string }>;
              };
            };
          };
          const lineErrors = err.response?.data?.errors;
          if (lineErrors && lineErrors.length > 0) {
            for (const lineError of lineErrors) {
              toast.error(`Ligne ${lineError.index + 1} : ${lineError.erreur}`);
            }
          } else {
            toast.error(
              err.response?.data?.detail || "Echec de l'enregistrement de l'approvisionnement."
            );
          }
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <SectionCard title="Informations du bon de livraison">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <Label>Date de l&apos;approvisionnement</Label>
            <Input
              type="date"
              value={dateReception}
              onChange={(e) => setDateReception(e.target.value)}
            />
          </div>
          <div>
            <Label>Fournisseur</Label>
            <Input
              type="text"
              value={fournisseur}
              onChange={(e) => setFournisseur(e.target.value)}
              placeholder="Nom du fournisseur"
            />
          </div>
          <div>
            <Label>Numero du bon de livraison</Label>
            <Input
              type="text"
              value={referenceBon}
              onChange={(e) => setReferenceBon(e.target.value)}
              placeholder="BL-0001"
            />
          </div>
          <div>
            <Label>Montant total du bon</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={montantTotalDeclare}
              onChange={(e) => setMontantTotalDeclare(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title={editingIndex != null ? "Modifier le medicament" : "Ajouter un medicament"}>
        <LigneForm
          key={editingIndex != null ? `edit-${editingIndex}` : `new-${addCounter}`}
          structureId={structureId}
          initial={editingIndex != null ? lignes[editingIndex] ?? null : null}
          onSubmit={handleSubmitLigne}
          onCancel={() => setEditingIndex(null)}
        />
      </SectionCard>

      <SectionCard title={`Medicaments de la livraison (${lignes.length})`}>
        <LignesTable lignes={lignes} onEdit={handleEdit} onDelete={handleDelete} />

        <div className="mt-4 rounded-md border bg-muted/30 p-4 text-sm">
          <div className="grid gap-2 sm:grid-cols-3">
            <p>
              Montant declare :{" "}
              <span className="font-medium">
                {montantDeclareNombre != null ? montantDeclareNombre.toFixed(2) : "0.00"} FCFA
              </span>
            </p>
            <p>
              Montant calcule :{" "}
              <span className="font-medium">{montantCalcule.toFixed(2)} FCFA</span>
            </p>
            <p className={montantCorrespond ? "text-emerald-700" : "text-destructive"}>
              {montantCorrespond
                ? "Controle montant correct"
                : `Ecart : ${ecartMontant != null ? ecartMontant.toFixed(2) : "0.00"} FCFA`}
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={handleSave} disabled={createMutation.isPending}>
            {createMutation.isPending ? "Enregistrement..." : "Enregistrer l'approvisionnement"}
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
