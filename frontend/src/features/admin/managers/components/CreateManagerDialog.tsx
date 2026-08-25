"use client";

import { useState } from "react";
import { Check, Copy, Hospital, Loader2, Pill, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import api from "@/lib/axios";

import { useCreateManager } from "../hooks/useCreateManager";
import type { AdminInvitationType } from "../types/manager";

const INVITATION_LABELS: Record<AdminInvitationType, string> = {
  PROPRIETAIRE_PHARMACIE: "Proprietaire de pharmacie",
  GESTIONNAIRE_HOPITAL: "Gestionnaire d'hopital",
};

export function CreateManagerDialog() {
  const [open, setOpen] = useState(false);
  const [invitationType, setInvitationType] =
    useState<AdminInvitationType>("PROPRIETAIRE_PHARMACIE");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [structureNom, setStructureNom] = useState("");
  const [createdEmail, setCreatedEmail] = useState<string | null>(null);
  const [createdType, setCreatedType] =
    useState<AdminInvitationType>("PROPRIETAIRE_PHARMACIE");
  const [otpCode, setOtpCode] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const createManager = useCreateManager();

  const isHospitalInvitation = invitationType === "GESTIONNAIRE_HOPITAL";
  const canSubmit =
    nom.trim().length >= 3 &&
    email.trim().length > 0 &&
    (!isHospitalInvitation || structureNom.trim().length >= 3) &&
    !createManager.isPending;

  function loadOtp(emailToLoad: string) {
    setOtpLoading(true);
    api
      .get(`/core/dev/otp/?email=${encodeURIComponent(emailToLoad)}`)
      .then(({ data }) => setOtpCode(data.code))
      .catch(() => setOtpCode(null))
      .finally(() => setOtpLoading(false));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    const cleanEmail = email.trim();
    createManager.mutate(
      {
        nom: nom.trim(),
        email: cleanEmail,
        invitation_type: invitationType,
        structure_nom: isHospitalInvitation ? structureNom.trim() : undefined,
      },
      {
        onSuccess: () => {
          setCreatedEmail(cleanEmail);
          setCreatedType(invitationType);
          setNom("");
          setEmail("");
          setStructureNom("");
          loadOtp(cleanEmail);
        },
      }
    );
  }

  function handleCopyLink() {
    if (!createdEmail) return;
    const link = `http://localhost:3000/fr/inscription`;
    navigator.clipboard.writeText(link);
    toast.success("Lien copie");
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
      setInvitationType("PROPRIETAIRE_PHARMACIE");
      setNom("");
      setEmail("");
      setStructureNom("");
      setCreatedEmail(null);
      setCreatedType("PROPRIETAIRE_PHARMACIE");
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
          Inviter un responsable
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle invitation</DialogTitle>
          <DialogDescription>
            {showOtpResult
              ? "Le compte a ete prepare. Transmettez les informations d'activation."
              : "Choisissez le type de responsable a inviter depuis l'administration SanteProx."}
          </DialogDescription>
        </DialogHeader>

        {showOtpResult ? (
          <div className="space-y-4">
            <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Type</p>
                <p className="flex items-center gap-2 text-sm font-medium">
                  {createdType === "GESTIONNAIRE_HOPITAL" ? (
                    <Hospital className="size-4 text-sky-600" />
                  ) : (
                    <Pill className="size-4 text-emerald-600" />
                  )}
                  {INVITATION_LABELS[createdType]}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{createdEmail}</p>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Code OTP</p>
                {otpLoading ? (
                  <p className="text-sm text-muted-foreground">Chargement...</p>
                ) : otpCode ? (
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold tracking-widest text-primary">
                      {otpCode}
                    </p>
                    <Button variant="ghost" size="sm" onClick={handleCopyOtp}>
                      {copied ? (
                        <Check className="size-4" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Code non disponible. Verifiez la console serveur ou l&apos;envoi email.
                  </p>
                )}
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">
                  Lien d&apos;activation
                </p>
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  <Copy className="mr-2 size-3" />
                  Copier le lien
                </Button>
              </div>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              Le proprietaire de pharmacie et le gestionnaire d&apos;hopital utilisent
              le meme parcours d&apos;activation par email et OTP. Apres connexion, la
              redirection est decidee par le role et par le type de structure active.
            </p>
            <DialogFooter>
              <Button onClick={() => handleClose(false)}>Fermer</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invitation-type">Type d&apos;invitation</Label>
              <Select
                id="invitation-type"
                value={invitationType}
                onChange={(event) =>
                  setInvitationType(event.target.value as AdminInvitationType)
                }
              >
                <option value="PROPRIETAIRE_PHARMACIE">
                  Proprietaire de pharmacie
                </option>
                <option value="GESTIONNAIRE_HOPITAL">
                  Gestionnaire d&apos;hopital
                </option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="manager-nom">Nom complet</Label>
              <Input
                id="manager-nom"
                placeholder="Jean Dupont"
                value={nom}
                onChange={(event) => setNom(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manager-email">Adresse email</Label>
              <Input
                id="manager-email"
                type="email"
                placeholder="jean@exemple.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            {isHospitalInvitation ? (
              <div className="space-y-2">
                <Label htmlFor="hospital-name">Nom de l&apos;hopital</Label>
                <Input
                  id="hospital-name"
                  placeholder="Hopital Central"
                  value={structureNom}
                  onChange={(event) => setStructureNom(event.target.value)}
                />
              </div>
            ) : null}
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
                {createManager.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <UserPlus className="size-4" />
                )}
                Creer l&apos;invitation
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
