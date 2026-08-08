"use client";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alerte } from "../types/alerte";
import { AlertePrioriteBadge } from "./AlertePrioriteBadge";
import { AlerteTypeBadge } from "./AlerteTypeBadge";
import { AlerteActionsRapides } from "./AlerteActionsRapides";
import { cn } from "@/lib/utils";

interface AlerteListeProps {
  alertes: Alerte[];
  role: string;
  onConsulter: (alerte: Alerte) => void;
}

export function AlerteListe({ alertes, role, onConsulter }: AlerteListeProps) {
  if (alertes.length === 0) {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        Aucune alerte trouvée pour le moment.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="p-3 font-medium">Priorité</th>
            <th className="p-3 font-medium">Type</th>
            <th className="p-3 font-medium">Alerte</th>
            <th className="p-3 font-medium">Date</th>
            <th className="p-3 font-medium">Heure</th>
            <th className="p-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {alertes.map((alerte) => (
            <tr
              key={alerte.id}
              className={cn(
                "border-b",
                !alerte.est_lue && "bg-warning/5"
              )}
            >
              <td className="p-3">
                <AlertePrioriteBadge priorite={alerte.priorite} />
              </td>
              <td className="p-3">
                <AlerteTypeBadge type={alerte.type} />
              </td>
              <td className="p-3 max-w-xs">
                <p className="flex items-center gap-2 font-medium">
                  {alerte.titre}
                  {!alerte.est_lue && (
                    <span className="rounded-full bg-warning/15 px-1.5 py-0.5 text-[10px] font-medium text-warning">
                      Non lue
                    </span>
                  )}
                </p>
                <p className="mt-0.5 truncate text-muted-foreground">
                  {alerte.description}
                </p>
              </td>
              <td className="p-3 whitespace-nowrap">{alerte.date_alerte}</td>
              <td className="p-3 whitespace-nowrap">{alerte.heure_alerte}</td>
              <td className="p-3">
                <div className="flex items-center justify-end gap-2">
                  <AlerteActionsRapides
                    module={alerte.module}
                    role={role}
                    label="Voir le module"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onConsulter(alerte)}
                    title="Consulter l'alerte"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
