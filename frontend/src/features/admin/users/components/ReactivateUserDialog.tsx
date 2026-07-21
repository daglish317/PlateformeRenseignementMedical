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
import { useReactivateUser } from "../hooks/useReactivateUser";
import type { UserAdmin } from "../types/user";

interface ReactivateUserDialogProps {
  user: UserAdmin | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReactivateUserDialog({ user, open, onOpenChange }: ReactivateUserDialogProps) {
  const reactivateMutation = useReactivateUser();

  const handleConfirm = () => {
    if (!user) return;
    reactivateMutation.mutate(user.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Réactiver l'utilisateur</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir réactiver l'utilisateur{" "}
            <span className="font-medium text-foreground">{user?.nom}</span> ?
            Il pourra à nouveau accéder à la plateforme.
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
