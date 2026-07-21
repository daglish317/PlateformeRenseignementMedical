"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SchedulePayload } from "../types/schedule";
import { ClosedSwitch } from "./ClosedSwitch";
import { validateSchedule } from "../validation/schedule.schema";

interface ScheduleFormProps {
  schedule: SchedulePayload;
  onSave: (payload: SchedulePayload) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function ScheduleForm({
  schedule,
  onSave,
  onCancel,
  isSaving,
}: ScheduleFormProps) {
  const [heureOuverture, setHeureOuverture] = useState(schedule.heure_ouverture);
  const [heureFermeture, setHeureFermeture] = useState(schedule.heure_fermeture);
  const [estFerme, setEstFerme] = useState(schedule.est_ferme);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const validationError = validateSchedule({
      heure_ouverture: heureOuverture,
      heure_fermeture: heureFermeture,
      est_ferme: estFerme,
    });
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onSave({
      jour: schedule.jour,
      heure_ouverture: heureOuverture,
      heure_fermeture: heureFermeture,
      est_ferme: estFerme,
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label className="text-sm text-muted-foreground">Jour</Label>
          <p className="font-medium capitalize">{schedule.jour.toLowerCase()}</p>
        </div>
        <div>
          <Label htmlFor="heure_ouverture">Heure ouverture</Label>
          <Input
            id="heure_ouverture"
            type="time"
            value={heureOuverture}
            onChange={(e) => setHeureOuverture(e.target.value)}
            disabled={estFerme}
          />
        </div>
        <div>
          <Label htmlFor="heure_fermeture">Heure fermeture</Label>
          <Input
            id="heure_fermeture"
            type="time"
            value={heureFermeture}
            onChange={(e) => setHeureFermeture(e.target.value)}
            disabled={estFerme}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ClosedSwitch checked={estFerme} onChange={setEstFerme} />
        <Label>Fermé</Label>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Annuler
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}
