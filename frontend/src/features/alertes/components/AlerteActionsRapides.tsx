"use client";
import { ExternalLink } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ModuleAlerte } from "../types/alerte";

const LIENS_GESTIONNAIRE: Record<ModuleAlerte, string> = {
  APPROVISIONNEMENT: "/pharmacy/supply",
  STOCK: "/pharmacy/stock",
  VENTE: "/pharmacy/sale",
  CAISSE: "/pharmacy/sale",
  INVENTAIRE: "/pharmacy/inventory",
};

const LIENS_PROPRIETAIRE: Record<ModuleAlerte, string> = {
  APPROVISIONNEMENT: "/owner/inventaires",
  STOCK: "/owner/inventaires",
  VENTE: "/owner/caisse",
  CAISSE: "/owner/caisse",
  INVENTAIRE: "/owner/inventaires",
};

export function lienModuleAlerte(
  module: ModuleAlerte,
  role: string
): string {
  if (role === "PROPRIETAIRE") {
    return LIENS_PROPRIETAIRE[module] ?? "/owner";
  }
  return LIENS_GESTIONNAIRE[module] ?? "/pharmacy";
}

interface AlerteActionsRapidesProps {
  module: ModuleAlerte;
  role: string;
  label?: string;
  size?: "default" | "sm";
}

export function AlerteActionsRapides({
  module,
  role,
  label = "Voir le module",
  size = "sm",
}: AlerteActionsRapidesProps) {
  return (
    <Link href={lienModuleAlerte(module, role)}>
      <Button variant="outline" size={size} className="gap-2">
        <ExternalLink className="h-4 w-4" />
        {label}
      </Button>
    </Link>
  );
}
