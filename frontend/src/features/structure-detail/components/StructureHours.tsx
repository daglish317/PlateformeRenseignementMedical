"use client";

import { Clock } from "lucide-react";
import type { StructureDetail } from "../types/structure-detail";

type StructureHoursProps = {
  structure: StructureDetail;
};

export default function StructureHours({ structure }: StructureHoursProps) {
  // Use type assertion since the current StructureDetail type might not have horaires defined
  const horaires = (structure as any).horaires || [];

  return (
    <section className="bg-card rounded-3xl p-8 shadow-sm border border-border mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Clock className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Horaires d'ouverture</h2>
      </div>
      
      {horaires.length > 0 ? (
        <div className="space-y-4">
          {horaires.map((horaire: any, index: number) => (
            <div key={index} className="flex justify-between items-center py-3 border-b border-border last:border-0">
              <span className="font-medium text-foreground">{horaire.jour}</span>
              <span className="text-muted-foreground">{horaire.heures}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground py-4">
          Les horaires ne sont pas disponibles pour le moment.
        </p>
      )}
    </section>
  );
}
