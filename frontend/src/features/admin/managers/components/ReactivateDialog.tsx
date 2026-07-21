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
import { useReactivateManager } from "../hooks/useReactivateManager";
import type { ManagerAdmin } from "../types/manager";

interface ReactivateDialogProps {
  manager: ManagerAdmin | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReactivateDialog({ manager, open, onOpenChange }: ReactivateDialogProps) {
  const reactivateMutation = useReactivateManager();

  const handleConfirm = () => {
    if (!manager) return;
    reactivateMutation.mutate(manager.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Réactiver le gestionnaire</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir réactiver le gestionnaire{" "}
            <span className="font-medium text-foreground">{manager?.nom}</span> ?
            Il pourra de nouveau se connecter à la plateforme.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={reactivateMutation.isPending}
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={reactivateMutation.isPending}
          >
            {reactivateMutation.isPending ? "Réactivation..." : "Réactiver"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
