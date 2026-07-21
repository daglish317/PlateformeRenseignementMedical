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
import { useSuspendManager } from "../hooks/useSuspendManager";
import type { ManagerAdmin } from "../types/manager";

interface SuspendDialogProps {
  manager: ManagerAdmin | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SuspendDialog({ manager, open, onOpenChange }: SuspendDialogProps) {
  const suspendMutation = useSuspendManager();

  const handleConfirm = () => {
    if (!manager) return;
    suspendMutation.mutate(manager.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suspendre le gestionnaire</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir suspendre le gestionnaire{" "}
            <span className="font-medium text-foreground">{manager?.nom}</span> ?
            Il ne pourra plus se connecter à la plateforme.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={suspendMutation.isPending}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={suspendMutation.isPending}
          >
            {suspendMutation.isPending ? "Suspension..." : "Suspendre"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
