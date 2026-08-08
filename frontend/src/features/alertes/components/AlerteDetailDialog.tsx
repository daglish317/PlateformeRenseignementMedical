"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Alerte } from "../types/alerte";
import { AlertePrioriteBadge } from "./AlertePrioriteBadge";
import { AlerteTypeBadge } from "./AlerteTypeBadge";
import { AlerteCategorieBadge } from "./AlerteCategorieBadge";
import { AlerteActionsRapides } from "./AlerteActionsRapides";

interface AlerteDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alerte: Alerte | null;
  role: string;
  marquageEnCours: boolean;
  onMarquerLue: (alerte: Alerte) => void;
}

function Champ({ label, valeur }: { label: string; valeur: string }) {
  if (!valeur) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{valeur}</p>
    </div>
  );
}

export function AlerteDetailDialog({
  open,
  onOpenChange,
  alerte,
  role,
  marquageEnCours,
  onMarquerLue,
}: AlerteDetailDialogProps) {
  if (!alerte) return null;
  const d = alerte.donnees;
  const estAlerteStock =
    alerte.type === "STOCK_FAIBLE" || alerte.type === "RUPTURE_STOCK";
  const estAlerteSupervision =
    alerte.type === "RETOURS_CAISSE_ANORMAUX" ||
    alerte.type === "VENTES_ANNULEES_ANORMALES";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlerteTypeBadge type={alerte.type} />
            <span>{alerte.titre}</span>
          </DialogTitle>
          <DialogDescription>
            Alerte du {alerte.date_alerte} à {alerte.heure_alerte}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <AlertePrioriteBadge priorite={alerte.priorite} />
          <AlerteCategorieBadge categorie={alerte.categorie} />
          <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Module : {alerte.module_label}
          </span>
          {alerte.est_resolue ? (
            <span className="flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success">
              <CheckCircle2 className="h-3 w-3" />
              Résolue
            </span>
          ) : alerte.est_lue ? (
            <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              <Eye className="h-3 w-3" />
              Lue
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-0.5 text-xs font-medium text-warning">
              <EyeOff className="h-3 w-3" />
              Non lue
            </span>
          )}
        </div>

        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">Description</p>
          <p className="mt-1">{alerte.description}</p>
        </div>

        {estAlerteStock && (
          <div className="grid gap-3 rounded-lg border bg-card p-3 sm:grid-cols-2">
            <Champ label="Médicament" valeur={d.medicament_nom ?? ""} />
            <Champ
              label="Stock disponible"
              valeur={String(d.stock_disponible ?? 0)}
            />
            <Champ
              label="Stock physique"
              valeur={String(d.stock_physique ?? 0)}
            />
            <Champ
              label="Quantité réservée"
              valeur={String(d.quantite_reservee ?? 0)}
            />
            <Champ
              label="Seuil d'alerte"
              valeur={String(d.seuil_alerte ?? 0)}
            />
          </div>
        )}

        {estAlerteSupervision && (
          <div className="grid gap-3 rounded-lg border bg-card p-3 sm:grid-cols-2">
            <Champ
              label="Nombre du jour"
              valeur={String(d.nombre ?? 0)}
            />
            <Champ label="Moyenne habituelle" valeur={String(d.moyenne ?? 0)} />
            <Champ label="Date concernée" valeur={d.date_concernee ?? ""} />
            <Champ
              label="Utilisateur concerné"
              valeur={alerte.utilisateur_concerne_nom ?? ""}
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          {!alerte.est_resolue && (
            <Button
              variant={alerte.est_lue ? "outline" : "default"}
              size="sm"
              onClick={() => onMarquerLue(alerte)}
              disabled={marquageEnCours || alerte.est_lue}
            >
              <CheckCircle2 className="h-4 w-4" />
              {alerte.est_lue ? "Déjà lue" : "Marquer comme lue"}
            </Button>
          )}
          <AlerteActionsRapides
            module={alerte.module}
            role={role}
            label="Consulter et agir"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
