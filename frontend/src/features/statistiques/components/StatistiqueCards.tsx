"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface CarteStatistique {
  titre: string;
  valeur: string;
  variation?: number | null;
  detail?: string;
  ton?: "default" | "success" | "warning" | "destructive";
}

interface StatistiqueCardsProps {
  cartes: CarteStatistique[];
}

export function StatistiqueCards({ cartes }: StatistiqueCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cartes.map((carte) => (
        <Card key={carte.titre}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {carte.titre}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-bold tracking-tight">
              {carte.valeur}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {carte.variation !== undefined &&
                carte.variation !== null && (
                  <Badge
                    variant={
                      carte.variation >= 0 ? "success" : "destructive"
                    }
                    className="gap-1"
                  >
                    {carte.variation >= 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {carte.variation >= 0 ? "+" : ""}
                    {carte.variation.toLocaleString("fr-FR")} %
                  </Badge>
                )}
              {carte.detail && (
                <span className="text-xs text-muted-foreground">
                  {carte.detail}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
