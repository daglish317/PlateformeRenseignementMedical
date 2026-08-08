"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SectionErreurProps {
  onReessayer?: () => void;
}

export function SectionErreur({ onReessayer }: SectionErreurProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center text-muted-foreground">
      <AlertTriangle className="h-8 w-8" />
      <p className="text-sm">
        Une erreur est survenue lors du chargement des statistiques.
      </p>
      {onReessayer && (
        <Button variant="outline" size="sm" onClick={onReessayer}>
          Réessayer
        </Button>
      )}
    </div>
  );
}
