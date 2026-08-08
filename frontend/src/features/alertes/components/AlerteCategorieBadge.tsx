"use client";
import { Badge } from "@/components/ui/badge";
import { CategorieAlerte } from "../types/alerte";

const VARIANTES: Record<CategorieAlerte, "default" | "outline"> = {
  OPERATIONNELLE: "default",
  SUPERVISION: "outline",
};

const LIBELLES: Record<CategorieAlerte, string> = {
  OPERATIONNELLE: "Opérationnelle",
  SUPERVISION: "Supervision",
};

interface AlerteCategorieBadgeProps {
  categorie: CategorieAlerte;
}

export function AlerteCategorieBadge({ categorie }: AlerteCategorieBadgeProps) {
  return (
    <Badge variant={VARIANTES[categorie] ?? "outline"}>
      {LIBELLES[categorie] ?? categorie}
    </Badge>
  );
}
