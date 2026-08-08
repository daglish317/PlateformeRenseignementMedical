"use client";
import { Button } from "@/components/ui/button";
import { StockItem } from "../types/stock";

interface DeleteStockDialogProps {
  item: StockItem | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export function DeleteStockDialog({ item, onConfirm, onCancel, isDeleting }: DeleteStockDialogProps) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Confirmer la suppression</h3>
        <p className="text-muted-foreground mb-4">
          Voulez-vous vraiment supprimer <strong>{item.nom}</strong> du stock ?
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={isDeleting}>Annuler</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Suppression..." : "Supprimer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
