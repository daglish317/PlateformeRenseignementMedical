"use client";
import { Badge } from "@/components/ui/badge";
import { TypeAlerte } from "../types/alerte";

const VARIANTES: Record<TypeAlerte, "secondary" | "warning" | "destructive"> = {
  STOCK_FAIBLE: "warning",
  RUPTURE_STOCK: "destructive",
  RETOURS_CAISSE_ANORMAUX: "secondary",
  VENTES_ANNULEES_ANORMALES: "secondary",
};

const LIBELLES: Record<TypeAlerte, string> = {
  STOCK_FAIBLE: "Stock faible",
  RUPTURE_STOCK: "Rupture de stock",
  RETOURS_CAISSE_ANORMAUX: "Retours caisse inhabituels",
  VENTES_ANNULEES_ANORMALES: "Annulations de vente inhabituelles",
};

interface AlerteTypeBadgeProps {
  type: TypeAlerte;
}

export function AlerteTypeBadge({ type }: AlerteTypeBadgeProps) {
  return (
    <Badge variant={VARIANTES[type] ?? "secondary"}>
      {LIBELLES[type] ?? type}
    </Badge>
  );
}
