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
import { useUpdateService } from "../hooks/useUpdateService";
import type { Service } from "../types/service";

interface EditServiceDialogProps {
  service: Service | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditServiceDialog({
  service,
  open,
  onOpenChange,
}: EditServiceDialogProps) {
  const [nom, setNom] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const updateService = useUpdateService();

  const [prevService, setPrevService] = useState(service);

  if (service !== prevService) {
    setPrevService(service);
    if (service) {
      setNom(service.nom);
      setType(service.type);
      setDescription(service.description);
    }
  }

  const canSubmit = nom.trim() && type && !updateService.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !service) return;

    updateService.mutate(
      { id: service.id, data: { nom: nom.trim(), type, description: description.trim() } },
      { onSuccess: () => onOpenChange(false) }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le service</DialogTitle>
          <DialogDescription>
            Modifiez les informations du service.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-service-nom">Nom</Label>
            <Input
              id="edit-service-nom"
              placeholder="Nom du service"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-service-type">Type</Label>
            <select
              id="edit-service-type"
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
            <Label htmlFor="edit-service-description">Description</Label>
            <Textarea
              id="edit-service-description"
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
              onClick={() => onOpenChange(false)}
              disabled={updateService.isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {updateService.isPending && (
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
