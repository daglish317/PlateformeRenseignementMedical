"use client";
import { Badge } from "@/components/ui/badge";

interface StockStatusBadgeProps {
  quantite: number;
  seuilAlerte: number;
  disponible: boolean;
}

export function StockStatusBadge({ quantite, disponible }: StockStatusBadgeProps) {
  if (!disponible || quantite === 0) {
    return <Badge variant="destructive">Rupture</Badge>;
  }
  if (quantite < 10) {
    return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">Stock faible</Badge>;
  }
  return <Badge className="bg-green-500 text-white hover:bg-green-600">Disponible</Badge>;
}
