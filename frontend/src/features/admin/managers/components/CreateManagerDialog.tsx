"use client";

import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCreateManager } from "../hooks/useCreateManager";

export function CreateManagerDialog() {
  const [open, setOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const createManager = useCreateManager();

  const canSubmit = nom.trim() && email.trim() && !createManager.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    createManager.mutate(
      { nom: nom.trim(), email: email.trim() },
      {
        onSuccess: () => {
          setNom("");
          setEmail("");
          setOpen(false);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="size-4" />
          Créer un gestionnaire
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau gestionnaire</DialogTitle>
          <DialogDescription>
            Créez un compte gestionnaire. Un email d'activation sera envoyé.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="manager-nom">Nom complet</Label>
            <Input
              id="manager-nom"
              placeholder="Jean Dupont"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="manager-email">Adresse email</Label>
            <Input
              id="manager-email"
              type="email"
              placeholder="jean@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createManager.isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {createManager.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Créer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
