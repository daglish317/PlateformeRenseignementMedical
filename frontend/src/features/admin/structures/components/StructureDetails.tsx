"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, MapPin, Phone } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StructurePhoto } from "./StructurePhoto";
import { StructureStatusBadge } from "./StructureStatusBadge";
import type { StructureAdmin } from "../types/structure";

interface StructureDetailsProps {
  structure: StructureAdmin | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onValidate: (structure: StructureAdmin) => void;
  onReject: (structure: StructureAdmin) => void;
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  );
}

export function StructureDetails({ structure, open, onOpenChange, onValidate, onReject }: StructureDetailsProps) {
  if (!structure) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Détails de la structure</SheetTitle>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <StructurePhoto photo={structure.photo} nom={structure.nom} className="h-16 w-16 rounded-xl" />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-semibold">{structure.nom}</h3>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={structure.type === "HOPITAL" ? "default" : "secondary"}>
                  {structure.type === "HOPITAL" ? "Hôpital" : "Pharmacie"}
                </Badge>
                <StructureStatusBadge statut={structure.statut} />
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-4">
            <InfoRow icon={MapPin} label="Adresse" value={structure.adresse} />
            <InfoRow icon={Phone} label="Téléphone" value={structure.telephone} />
            <InfoRow
              icon={Calendar}
              label="Date de création"
              value={format(new Date(structure.date_creation), "dd MMMM yyyy", { locale: fr })}
            />
            {structure.date_validation && (
              <InfoRow
                icon={Calendar}
                label="Date de validation"
                value={format(new Date(structure.date_validation), "dd MMMM yyyy", { locale: fr })}
              />
            )}
          </div>

          {structure.statut === "EN_ATTENTE" && (
            <>
              <Separator />
              <div className="flex gap-3">
                <Button className="flex-1" onClick={() => onValidate(structure)}>
                  Valider
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => onReject(structure)}>
                  Refuser
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
