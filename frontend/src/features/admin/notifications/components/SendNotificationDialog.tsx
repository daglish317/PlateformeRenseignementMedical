"use client";

import { useState } from "react";
import { Send, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationsService } from "../api/notifications.service";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function SendNotificationDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [titre, setTitre] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      notificationsService.broadcast({
        titre: titre.trim(),
        message: message.trim(),
        type: "ADMIN",
        nav_item: "notifications",
      }),
    onSuccess: () => {
      toast.success("Notification envoyée à tous les gestionnaires");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-counts"] });
      setOpen(false);
      setTitre("");
      setMessage("");
    },
    onError: () => {
      toast.error("Impossible d'envoyer la notification");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!titre.trim()) { setError("Le titre est requis."); return; }
    if (!message.trim()) { setError("Le message est requis."); return; }
    mutate();
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
            Cette notification sera envoyée à tous les gestionnaires de structures.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground flex items-center gap-2">
            <Radio className="h-4 w-4" />
            Destinataires : tous les gestionnaires actifs
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
            <Label htmlFor="notification-message">Message</Label>
            <Textarea
              id="notification-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Contenu de la notification"
              rows={4}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Envoi..." : "Envoyer à tous"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
