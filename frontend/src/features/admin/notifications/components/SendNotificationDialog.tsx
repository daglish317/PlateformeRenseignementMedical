"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSendNotification } from "../hooks/useSendNotification";

export function SendNotificationDialog() {
  const { mutate, isPending } = useSendNotification();
  const [open, setOpen] = useState(false);
  const [destinataireId, setDestinataireId] = useState("");
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [type, setType] = useState("INFO");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!destinataireId.trim()) {
      setError("L'ID du destinataire est requis.");
      return;
    }
    if (!titre.trim()) {
      setError("Le titre est requis.");
      return;
    }
    if (!contenu.trim()) {
      setError("Le contenu est requis.");
      return;
    }

    mutate(
      {
        destinataire_id: destinataireId,
        titre: titre.trim(),
        contenu: contenu.trim(),
        type,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setDestinataireId("");
          setTitre("");
          setContenu("");
          setType("INFO");
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Send className="mr-2 h-4 w-4" />
          Envoyer une notification
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Envoyer une notification</DialogTitle>
          <DialogDescription>
            Envoyer une notification à un utilisateur de la plateforme.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="destinataire-id">ID du destinataire</Label>
            <Input
              id="destinataire-id"
              value={destinataireId}
              onChange={(e) => setDestinataireId(e.target.value)}
              placeholder="UUID de l'utilisateur"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification-type">Type</Label>
            <Select
              id="notification-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="INFO">Information</option>
              <option value="ALERTE">Alerte</option>
              <option value="RAPPEL">Rappel</option>
              <option value="SYSTEME">Système</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification-titre">Titre</Label>
            <Input
              id="notification-titre"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Titre de la notification"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification-contenu">Contenu</Label>
            <Textarea
              id="notification-contenu"
              value={contenu}
              onChange={(e) => setContenu(e.target.value)}
              placeholder="Contenu de la notification"
              rows={4}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Envoi..." : "Envoyer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
