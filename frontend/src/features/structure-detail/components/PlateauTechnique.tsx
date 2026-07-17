"use client";

import { Microscope } from "lucide-react";
import type { StructureDetail } from "../types/structure-detail";

type PlateauTechniqueProps = {
  structure: StructureDetail;
};

export default function PlateauTechnique({ structure }: PlateauTechniqueProps) {
  if (structure.type !== "HOPITAL") return null;
  
  const plateauTechnique = (structure as any).plateauTechnique || [];

  if (plateauTechnique.length === 0) return null;

  return (
    <section className="bg-card rounded-3xl p-8 shadow-sm border border-border mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Microscope className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Plateau Technique</h2>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {plateauTechnique.map((equipement: string, index: number) => (
          <span 
            key={index} 
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-medium"
          >
            {equipement}
          </span>
        ))}
      </div>
    </section>
  );
}
