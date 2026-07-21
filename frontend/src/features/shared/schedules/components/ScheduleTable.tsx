"use client";

import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Schedule } from "../types/schedule";

interface ScheduleTableProps {
  schedules: Schedule[];
  onEdit: (schedule: Schedule) => void;
}

export function ScheduleTable({ schedules, onEdit }: ScheduleTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="py-3 px-4 font-medium">Jour</th>
            <th className="py-3 px-4 font-medium">Heure ouverture</th>
            <th className="py-3 px-4 font-medium">Heure fermeture</th>
            <th className="py-3 px-4 font-medium">Statut</th>
            <th className="py-3 px-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => (
            <tr key={schedule.id} className="border-b last:border-0">
              <td className="py-3 px-4 capitalize font-medium">
                {schedule.jour.toLowerCase()}
              </td>
              <td className="py-3 px-4">
                {schedule.est_ferme ? "—" : schedule.heure_ouverture}
              </td>
              <td className="py-3 px-4">
                {schedule.est_ferme ? "—" : schedule.heure_fermeture}
              </td>
              <td className="py-3 px-4">
                {schedule.est_ferme ? (
                  <Badge variant="destructive">Fermé</Badge>
                ) : (
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                    Ouvert
                  </Badge>
                )}
              </td>
              <td className="py-3 px-4 text-right">
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
