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
import { useResetPassword } from "../hooks/useResetPassword";
import type { ManagerAdmin } from "../types/manager";

interface ResetPasswordDialogProps {
  manager: ManagerAdmin | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResetPasswordDialog({ manager, open, onOpenChange }: ResetPasswordDialogProps) {
  const resetMutation = useResetPassword();

  const handleConfirm = () => {
    if (!manager) return;
    resetMutation.mutate(manager.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
          <DialogDescription>
            Un email de réinitialisation sera envoyé à{" "}
            <span className="font-medium text-foreground">{manager?.email}</span>.
            Le gestionnaire devra créer un nouveau mot de passe.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={resetMutation.isPending}
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={resetMutation.isPending}
          >
            {resetMutation.isPending ? "Envoi..." : "Envoyer l'email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
