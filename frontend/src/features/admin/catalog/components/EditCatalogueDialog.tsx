"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useUpdateCatalogue } from "../hooks/useUpdateCatalogue";
import type { Catalogue } from "../types/catalog";

interface EditCatalogueDialogProps {
  catalogue: Catalogue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCatalogueDialog({
  catalogue,
  open,
  onOpenChange,
}: EditCatalogueDialogProps) {
  const [nom, setNom] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const updateCatalogue = useUpdateCatalogue();

  const [prevCatalogue, setPrevCatalogue] = useState(catalogue);

  if (catalogue !== prevCatalogue) {
    setPrevCatalogue(catalogue);
    if (catalogue) {
      setNom(catalogue.nom);
      setType(catalogue.type);
      setDescription(catalogue.description);
    }
  }

  const canSubmit = nom.trim() && type && !updateCatalogue.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !catalogue) return;

    updateCatalogue.mutate(
      { id: catalogue.id, data: { nom: nom.trim(), type, description: description.trim() } },
      { onSuccess: () => onOpenChange(false) }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le catalogue</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l&apos;élément catalogue.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-catalogue-nom">Nom</Label>
            <Input
              id="edit-catalogue-nom"
              placeholder="Nom du catalogue"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-catalogue-type">Type</Label>
            <select
              id="edit-catalogue-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="">Sélectionner un type</option>
              <option value="MALADIE">Maladie</option>
              <option value="ANALYSE">Analyse</option>
              <option value="EXAMEN">Examen</option>
              <option value="SERVICE_MEDICAL">Service médical</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-catalogue-description">Description</Label>
            <Textarea
              id="edit-catalogue-description"
              placeholder="Description du catalogue"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateCatalogue.isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {updateCatalogue.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
