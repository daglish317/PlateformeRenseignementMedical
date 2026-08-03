"use client";

import { useState } from "react";
import { Loader2, UserPlus, Copy, Check } from "lucide-react";
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
import { toast } from "sonner";
import api from "@/lib/axios";

export function CreateManagerDialog() {
  const [open, setOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [createdEmail, setCreatedEmail] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const createManager = useCreateManager();

  const canSubmit = nom.trim() && email.trim() && !createManager.isPending;

  function loadOtp(emailToLoad: string) {
    setOtpLoading(true);
    api
      .get(`/core/dev/otp/?email=${encodeURIComponent(emailToLoad)}`)
      .then(({ data }) => setOtpCode(data.code))
      .catch(() => setOtpCode(null))
      .finally(() => setOtpLoading(false));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    createManager.mutate(
      { nom: nom.trim(), email: email.trim() },
      {
        onSuccess: () => {
          setCreatedEmail(email.trim());
          setNom("");
          setEmail("");
          loadOtp(email.trim());
        },
      }
    );
  }

  function handleCopyLink() {
    if (!createdEmail) return;
    const link = `http://localhost:3000/fr/inscription`;
    navigator.clipboard.writeText(link);
    toast.success("Lien copié !");
  }

  function handleCopyOtp() {
    if (!otpCode) return;
    navigator.clipboard.writeText(otpCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleClose(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) {
      setCreatedEmail(null);
      setOtpCode(null);
      setCopied(false);
    }
  }

  const showOtpResult = createdEmail && !createManager.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
            {showOtpResult
              ? "Le gestionnaire a été créé. Voici les informations de connexion :"
              : "Créez un compte gestionnaire. Un email d'activation sera envoyé."}
          </DialogDescription>
        </DialogHeader>

        {showOtpResult ? (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="text-sm font-medium">{createdEmail}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Code OTP</p>
                {otpLoading ? (
                  <p className="text-sm text-muted-foreground">Chargement...</p>
                ) : otpCode ? (
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold tracking-widest text-primary">{otpCode}</p>
                    <Button variant="ghost" size="sm" onClick={handleCopyOtp}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Code non disponible (vérifiez la console du serveur)</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Lien d&apos;activation</p>
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  <Copy className="mr-2 h-3 w-3" />
                  Copier le lien
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Partagez ces informations avec le gestionnaire. Il devra aller sur la page d&apos;inscription, entrer son email, valider le code OTP, définir son mot de passe, puis remplir les informations de sa structure avec sa géolocalisation activée.
            </p>
            <DialogFooter>
              <Button onClick={() => handleClose(false)}>Fermer</Button>
            </DialogFooter>
          </div>
        ) : (
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
                onClick={() => handleClose(false)}
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
        )}
      </DialogContent>
    </Dialog>
  );
}
