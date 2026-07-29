"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCreateService } from "../hooks/useCreateService";

export function CreateServiceDialog() {
  const [open, setOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const createService = useCreateService();

  const canSubmit = nom.trim() && type && !createService.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    createService.mutate(
      { nom: nom.trim(), type, description: description.trim() },
      {
        onSuccess: () => {
          setNom("");
          setType("");
          setDescription("");
          setOpen(false);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Nouveau service
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau service</DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau service médical.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service-nom">Nom</Label>
            <Input
              id="service-nom"
              placeholder="Nom du service"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="service-type">Type</Label>
            <select
              id="service-type"
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
            <Label htmlFor="service-description">Description</Label>
            <Textarea
              id="service-description"
              placeholder="Description du service"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createService.isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {createService.isPending && (
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
