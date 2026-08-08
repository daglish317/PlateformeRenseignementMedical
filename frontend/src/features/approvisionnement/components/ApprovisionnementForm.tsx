"use client";
import { useState } from "react";
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

export function ApprovisionnementForm({
  structureId,
}: ApprovisionnementFormProps) {
  const {
    dateReception,
    fournisseur,
    referenceBon,
    lignes,
    setDateReception,
    setFournisseur,
    setReferenceBon,
    addLigne,
    updateLigne,
    removeLigne,
    reset,
  } = useApprovisionnementStore();

  const createMutation = useCreateApprovisionnement(structureId);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [addCounter, setAddCounter] = useState(0);

  const handleSubmitLigne = (ligne: LigneInput) => {
    if (editingIndex != null) {
      updateLigne(editingIndex, ligne);
      toast.success("Ligne modifiée");
      setEditingIndex(null);
    } else {
      addLigne(ligne);
      toast.success("Médicament ajouté à la livraison");
      setAddCounter((counter) => counter + 1);
    }
  };

  const handleEdit = (index: number) => setEditingIndex(index);

  const handleDelete = (index: number) => {
    removeLigne(index);
    if (editingIndex === index) setEditingIndex(null);
    toast.success("Ligne supprimée");
  };

  const handleSave = () => {
    if (lignes.length === 0) {
      toast.error("Ajoutez au moins un médicament avant d'enregistrer.");
      return;
    }
    if (!dateReception) {
      toast.error("La date de réception est obligatoire.");
      return;
    }

    createMutation.mutate(
      {
        date_reception: dateReception,
        fournisseur,
        reference_bon: referenceBon,
        lignes,
      },
      {
        onSuccess: () => {
          toast.success("Approvisionnement enregistré avec succès");
          setEditingIndex(null);
          reset();
        },
        onError: (error: unknown) => {
          const err = error as {
            response?: { data?: { errors?: Array<{ index: number; erreur: string }> } };
          };
          const lineErrors = err.response?.data?.errors;
          if (lineErrors && lineErrors.length > 0) {
            for (const lineError of lineErrors) {
              toast.error(`Ligne ${lineError.index + 1} : ${lineError.erreur}`);
            }
          } else {
            toast.error(
              "Échec de l'enregistrement de l'approvisionnement."
            );
          }
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <SectionCard title="Informations de la livraison">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label>Date de réception</Label>
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
            <Label>Référence du bon</Label>
            <Input
              type="text"
              value={referenceBon}
              onChange={(e) => setReferenceBon(e.target.value)}
              placeholder="Optionnelle"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title={editingIndex != null ? "Modifier le médicament" : "Ajouter un médicament"}>
        <LigneForm
          key={editingIndex != null ? `edit-${editingIndex}` : `new-${addCounter}`}
          structureId={structureId}
          initial={
            editingIndex != null ? lignes[editingIndex] ?? null : null
          }
          onSubmit={handleSubmitLigne}
          onCancel={() => setEditingIndex(null)}
        />
      </SectionCard>

      <SectionCard title={`Médicaments de la livraison (${lignes.length})`}>
        <LignesTable
          lignes={lignes}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending
              ? "Enregistrement..."
              : "Enregistrer l'approvisionnement"}
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
