"use client";

import { Pill } from "lucide-react";
import type { StructureDetail } from "../types/structure-detail";

type StructureMedicamentsProps = {
  structure: StructureDetail;
};

export default function StructureMedicaments({ structure }: StructureMedicamentsProps) {
  if (structure.type !== "PHARMACIE") return null;
  const medicaments = structure.medicaments ?? [];

  return (
    <section className="bg-card rounded-3xl p-8 shadow-sm border border-border mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Pill className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Médicaments disponibles</h2>
      </div>
      
      {medicaments.length > 0 ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medicaments.map((med: string, index: number) => (
            <li key={index} className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
              <Pill className="h-4 w-4 text-primary" />
              <span className="font-medium">{med}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-center py-8 bg-muted/30 rounded-2xl">
          Veuillez contacter la pharmacie pour connaître la disponibilité des médicaments.
        </p>
      )}
    </section>
  );
}
