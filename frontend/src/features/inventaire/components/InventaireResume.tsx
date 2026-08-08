"use client";
import { Package, CheckCircle2, AlertTriangle, Ban } from "lucide-react";
import { Inventaire } from "../types/inventaire";
import { cn } from "@/lib/utils";

interface InventaireResumeProps {
  inventaire: Inventaire;
  className?: string;
}

export function InventaireResume({ inventaire, className }: InventaireResumeProps) {
  const elements = [
    {
      label: "Total produits",
      valeur: inventaire.nombre_total_produits,
      icon: Package,
      classe: "text-muted-foreground",
    },
    {
      label: "Disponibles",
      valeur: inventaire.nombre_disponibles,
      icon: CheckCircle2,
      classe: "text-success",
    },
    {
      label: "Stock faible",
      valeur: inventaire.nombre_stock_faible,
      icon: AlertTriangle,
      classe: "text-warning",
    },
    {
      label: "Ruptures",
      valeur: inventaire.nombre_ruptures,
      icon: Ban,
      classe: "text-destructive",
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-4",
        className
      )}
    >
      {elements.map(({ label, valeur, icon: Icon, classe }) => (
        <div
          key={label}
          className="flex items-center gap-3 rounded-xl border bg-card p-3"
        >
          <div className={cn("shrink-0", classe)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-semibold leading-none">{valeur}</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
