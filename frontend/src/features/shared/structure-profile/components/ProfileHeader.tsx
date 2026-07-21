"use client";

import { Building2, Calendar } from "lucide-react";
import type { StructureProfile } from "../types/structure-profile";

interface ProfileHeaderProps {
  structure: StructureProfile;
}

const statutConfig: Record<StructureProfile["statut"], { label: string; className: string }> = {
  EN_ATTENTE: {
    label: "En attente",
    className: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  },
  ACTIVE: {
    label: "Active",
    className: "bg-green-100 text-green-800 border border-green-300",
  },
  REFUSEE: {
    label: "Refusée",
    className: "bg-red-100 text-red-800 border border-red-300",
  },
};

const typeConfig: Record<StructureProfile["type"], { label: string; className: string }> = {
  HOPITAL: {
    label: "Hôpital",
    className: "bg-blue-100 text-blue-800 border border-blue-300",
  },
  PHARMACIE: {
    label: "Pharmacie",
    className: "bg-purple-100 text-purple-800 border border-purple-300",
  },
};

export function ProfileHeader({ structure }: ProfileHeaderProps) {
  const statut = statutConfig[structure.statut];
  const type = typeConfig[structure.type];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{structure.nom}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Créée le {new Date(structure.date_creation).toLocaleDateString("fr-FR")}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${type.className}`}>
          {type.label}
        </span>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statut.className}`}>
          {statut.label}
        </span>
      </div>
    </div>
  );
}
