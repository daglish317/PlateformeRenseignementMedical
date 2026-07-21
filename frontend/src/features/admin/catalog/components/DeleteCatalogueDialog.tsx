"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteCatalogue } from "../hooks/useDeleteCatalogue";
import type { Catalogue } from "../types/catalog";

interface DeleteCatalogueDialogProps {
  catalogue: Catalogue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCatalogueDialog({
  catalogue,
  open,
  onOpenChange,
}: DeleteCatalogueDialogProps) {
  const deleteMutation = useDeleteCatalogue();

  const handleConfirm = () => {
    if (!catalogue) return;
    deleteMutation.mutate(catalogue.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer le catalogue</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer définitivement l&apos;élément{" "}
            <span className="font-medium text-foreground">{catalogue?.nom}</span> ?
            Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
