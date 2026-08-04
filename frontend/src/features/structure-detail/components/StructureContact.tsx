"use client";

import { Phone, Mail, Globe } from "lucide-react";
import type { StructureDetail } from "../types/structure-detail";

type StructureContactProps = {
  structure: StructureDetail;
};

export default function StructureContact({ structure }: StructureContactProps) {
  return (
    <section className="bg-card rounded-3xl p-8 shadow-sm border border-border mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Phone className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Contact</h2>
      </div>
      
      <div className="space-y-4">
        {structure.telephone ? (
          <a 
            href={`tel:${structure.telephone}`}
            className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
          >
            <div className="p-2 bg-background rounded-lg shadow-sm group-hover:scale-105 transition-transform">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <span className="font-semibold text-lg">{structure.telephone}</span>
          </a>
        ) : (
          <p className="text-muted-foreground py-2">
            Numéro de téléphone non renseigné.
          </p>
        )}
        
        {/* Placeholder for future email/website fields if they get added to StructureDetail */}
        {structure.email && (
          <a 
            href={`mailto:${structure.email}`}
            className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
          >
            <div className="p-2 bg-background rounded-lg shadow-sm group-hover:scale-105 transition-transform">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <span className="font-medium">{structure.email}</span>
          </a>
        )}
        
        {structure.website && (
          <a 
            href={structure.website}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
          >
            <div className="p-2 bg-background rounded-lg shadow-sm group-hover:scale-105 transition-transform">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <span className="font-medium text-primary hover:underline">Site web officiel</span>
          </a>
        )}
      </div>
    </section>
  );
}
