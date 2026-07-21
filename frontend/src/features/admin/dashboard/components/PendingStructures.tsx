"use client";

import { Building2, Hospital, Pill } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminSection } from "../../shared/components/AdminSection";
import { AdminEmptyState } from "../../shared/components/AdminEmptyState";
import type { DashboardStructure } from "../types/dashboard";

interface PendingStructuresProps {
  structures: DashboardStructure[];
}

function StructureTypeIcon({ type }: { type: DashboardStructure["type"] }) {
  if (type === "HOPITAL") {
    return <Hospital className="h-4 w-4 text-red-500" />;
  }
  return <Pill className="h-4 w-4 text-green-500" />;
}

export function PendingStructures({ structures }: PendingStructuresProps) {
  return (
    <AdminSection>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Structures en attente</h2>
          <p className="text-sm text-muted-foreground">Maximum 10 structures</p>
        </div>
        <Button variant="outline" size="sm" render={<Link href="/admin/structures" />}>
          Voir tout
        </Button>
      </div>

      {structures.length === 0 ? (
        <AdminEmptyState
          title="Aucune structure en attente"
          description="Toutes les structures ont été traitées."
        />
      ) : (
        <div className="space-y-3">
          {structures.map((structure) => (
            <div
              key={structure.id}
              className="flex items-center gap-4 rounded-lg border p-3"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                {structure.photo ? (
                  <img
                    src={structure.photo}
                    alt={structure.nom}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium">{structure.nom}</p>
                  <StructureTypeIcon type={structure.type} />
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {structure.adresse}
                </p>
                {structure.date_creation && (
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(structure.date_creation), "dd MMM yyyy", { locale: fr })}
                  </p>
                )}
              </div>
              <Badge variant="outline">En attente</Badge>
              <Button size="sm" render={<Link href="/admin/structures" />}>
                Examiner
              </Button>
            </div>
          ))}
        </div>
      )}
    </AdminSection>
  );
}
