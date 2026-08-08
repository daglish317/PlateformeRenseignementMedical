"use client";
import { Badge } from "@/components/ui/badge";
import { StatutInventaire } from "../types/inventaire";

const VARIANTES: Record<
  StatutInventaire,
  "success" | "warning" | "destructive"
> = {
  DISPONIBLE: "success",
  STOCK_FAIBLE: "warning",
  RUPTURE: "destructive",
};

const LIBELLES: Record<StatutInventaire, string> = {
  DISPONIBLE: "Disponible",
  STOCK_FAIBLE: "Stock faible",
  RUPTURE: "Rupture",
};

interface InventaireStatutBadgeProps {
  statut: StatutInventaire;
}

export function InventaireStatutBadge({ statut }: InventaireStatutBadgeProps) {
  return (
    <Badge variant={VARIANTES[statut] ?? "outline"}>
      {LIBELLES[statut] ?? statut}
    </Badge>
  );
}
