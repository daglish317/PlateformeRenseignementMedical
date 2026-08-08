"use client";
import { Badge } from "@/components/ui/badge";
import { TypeEvenementHistorique } from "../types/historique";

const VARIANTES: Record<TypeEvenementHistorique, "secondary" | "success" | "warning" | "destructive" | "default"> = {
  APPROVISIONNEMENT_CREE: "secondary",
  INVENTAIRE_GENERE: "default",
  CAISSE_RETOUR: "warning",
};

interface HistoriqueTypeBadgeProps {
  type: TypeEvenementHistorique;
}

export function HistoriqueTypeBadge({ type }: HistoriqueTypeBadgeProps) {
  const libelles: Record<TypeEvenementHistorique, string> = {
    APPROVISIONNEMENT_CREE: "Approvisionnement enregistrÃ©",
    INVENTAIRE_GENERE: "Inventaire gÃ©nÃ©rÃ©",
    CAISSE_RETOUR: "Retour caisse",
  };
  return (
    <Badge variant={VARIANTES[type] ?? "secondary"}>
      {libelles[type] ?? type}
    </Badge>
  );
}
