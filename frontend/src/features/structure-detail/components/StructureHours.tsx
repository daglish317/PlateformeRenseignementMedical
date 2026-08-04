"use client";

import { Clock } from "lucide-react";
import type { StructureDetail } from "../types/structure-detail";

type StructureHoursProps = {
  structure: StructureDetail;
};

export default function StructureHours({ structure }: StructureHoursProps) {
  const horaires = structure.horaires ?? [];

  return (
    <section className="bg-card rounded-3xl p-8 shadow-sm border border-border mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Clock className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Horaires d&apos;ouverture</h2>
      </div>

      {horaires.length > 0 ? (
        <div className="space-y-4">
          {horaires.map((horaire, index: number) => (
            <div key={index} className="flex items-center justify-between border-b border-border py-3 last:border-0">
              <span className="font-medium text-foreground">{horaire.jour}</span>
              <span className="text-muted-foreground">{horaire.heures}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-4 text-muted-foreground">
          Les horaires ne sont pas disponibles pour le moment.
        </p>
      )}
    </section>
  );
}
