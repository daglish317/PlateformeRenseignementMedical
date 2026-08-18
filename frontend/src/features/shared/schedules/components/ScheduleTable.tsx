"use client";

import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Schedule } from "../types/schedule";

interface ScheduleTableProps {
  schedules: Schedule[];
  onEdit: (schedule: Schedule) => void;
}

function formatHours(schedule: Schedule) {
  if (schedule.est_ferme) return "—";
  if (schedule.heure_ouverture === schedule.heure_fermeture) {
    return "24h/24";
  }
  return schedule.heure_ouverture;
}

export function ScheduleTable({ schedules, onEdit }: ScheduleTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="px-4 py-3 font-medium">Jour</th>
            <th className="px-4 py-3 font-medium">Heure ouverture</th>
            <th className="px-4 py-3 font-medium">Heure fermeture</th>
            <th className="px-4 py-3 font-medium">Statut</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => (
            <tr key={schedule.id} className="border-b last:border-0">
              <td className="px-4 py-3 font-medium capitalize">
                {schedule.jour.toLowerCase()}
              </td>
              <td className="px-4 py-3">{formatHours(schedule)}</td>
              <td className="px-4 py-3">
                {schedule.est_ferme
                  ? "—"
                  : schedule.heure_ouverture === schedule.heure_fermeture
                    ? "24h/24"
                    : schedule.heure_fermeture}
              </td>
              <td className="px-4 py-3">
                {schedule.est_ferme ? (
                  <Badge variant="destructive">Fermé</Badge>
                ) : (
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                    Ouvert
                  </Badge>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(schedule)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
