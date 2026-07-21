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
import { useSuspendUser } from "../hooks/useSuspendUser";
import type { UserAdmin } from "../types/user";

interface SuspendUserDialogProps {
  user: UserAdmin | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SuspendUserDialog({ user, open, onOpenChange }: SuspendUserDialogProps) {
  const suspendMutation = useSuspendUser();

  const handleConfirm = () => {
    if (!user) return;
    suspendMutation.mutate(user.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suspendre l'utilisateur</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir suspendre l'utilisateur{" "}
            <span className="font-medium text-foreground">{user?.nom}</span> ?
            Il ne pourra plus accéder à la plateforme.
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
