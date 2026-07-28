"use client";

import { useState } from "react";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { Button } from "@/components/ui/button";
import { useSchedules } from "../hooks/useSchedules";
import { useCreateSchedules } from "../hooks/useCreateSchedules";
import { Schedule, SchedulePayload, DayOfWeek } from "../types/schedule";
import { ScheduleTable } from "../components/ScheduleTable";
import { ScheduleForm } from "../components/ScheduleForm";

const ALL_DAYS: DayOfWeek[] = [
  "LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI", "DIMANCHE",
];

function buildDefaultSchedules(): SchedulePayload[] {
  return ALL_DAYS.map((jour) => ({
    jour,
    heure_ouverture: jour === "DIMANCHE" ? "00:00" : "08:00",
    heure_fermeture: jour === "DIMANCHE" ? "00:00" : "18:00",
    est_ferme: jour === "DIMANCHE",
  }));
}

interface SchedulesPageProps {
  structureId: string;
}

export function SchedulesPage({ structureId }: SchedulesPageProps) {
  const { data: schedulesResponse, isLoading, error } = useSchedules(structureId);
  const { mutate: saveSchedules, isPending: isSaving } = useCreateSchedules(structureId);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [allSchedules, setAllSchedules] = useState<SchedulePayload[] | null>(null);
  const [isBulkEdit, setIsBulkEdit] = useState(false);

  const existingSchedules: Schedule[] = schedulesResponse?.data ?? [];
  const hasSchedules = existingSchedules.length > 0;

  const handleInitDefaults = () => {
    const defaults = buildDefaultSchedules();
    saveSchedules(defaults);
  };

  const handleSaveSingle = (payload: SchedulePayload) => {
    if (!hasSchedules) return;

    const updated = existingSchedules.map((s) =>
      s.jour === payload.jour
        ? payload
        : {
            jour: s.jour,
            heure_ouverture: s.heure_ouverture,
            heure_fermeture: s.heure_fermeture,
            est_ferme: s.est_ferme,
          }
    );
    saveSchedules(updated, {
      onSuccess: () => setEditingSchedule(null),
    });
  };

  const handleStartBulkEdit = () => {
    const current: SchedulePayload[] = ALL_DAYS.map((jour) => {
      const existing = existingSchedules.find((s) => s.jour === jour);
      return existing
        ? {
            jour: existing.jour,
            heure_ouverture: existing.heure_ouverture,
            heure_fermeture: existing.heure_fermeture,
            est_ferme: existing.est_ferme,
          }
        : {
            jour,
            heure_ouverture: "08:00",
            heure_fermeture: "18:00",
            est_ferme: jour === "DIMANCHE",
          };
    });
    setAllSchedules(current);
    setIsBulkEdit(true);
  };

  const handleBulkEditChange = (jour: DayOfWeek, field: keyof SchedulePayload, value: string | boolean) => {
    if (!allSchedules) return;
    setAllSchedules((prev) =>
      prev!.map((s) => (s.jour === jour ? { ...s, [field]: value } : s))
    );
  };

  const handleSaveBulk = () => {
    if (!allSchedules) return;
    saveSchedules(allSchedules, {
      onSuccess: () => {
        setIsBulkEdit(false);
        setAllSchedules(null);
      },
    });
  };

  if (isLoading) {
    return (
      <PageContainer>
        <PageTitle title="Horaires" subtitle="Gérez les horaires d'ouverture." />
        <p className="text-muted-foreground p-4">Chargement...</p>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageTitle title="Horaires" subtitle="Gérez les horaires d'ouverture." />
        <p className="text-destructive p-4">Erreur lors du chargement des horaires.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageTitle
        title="Horaires"
        subtitle="Gérez les horaires d'ouverture."
        actions={
          hasSchedules && !isBulkEdit ? (
            <Button onClick={handleStartBulkEdit}>
              Modifier tous les horaires
            </Button>
          ) : undefined
        }
      />

      <SectionCard title="Horaires d'ouverture">
        {!hasSchedules && !isBulkEdit ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <p className="text-muted-foreground">
              Aucun horaire n&apos;a été configuré pour cette structure.
            </p>
            <Button onClick={handleInitDefaults} disabled={isSaving}>
              {isSaving ? "Création..." : "Initialiser les horaires par défaut"}
            </Button>
          </div>
        ) : isBulkEdit && allSchedules ? (
          <div className="space-y-4 p-4">
            <p className="text-sm text-muted-foreground">
              Modifiez les horaires de chaque jour puis enregistrez.
            </p>
            {allSchedules.map((s) => (
              <div key={s.jour} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center border-b pb-3">
                <span className="font-medium capitalize">{s.jour.toLowerCase()}</span>
                <div>
                  <label className="text-xs text-muted-foreground">Ouverture</label>
                  <input
                    type="time"
                    className="w-full rounded border bg-background px-2 py-1.5 text-sm"
                    value={s.heure_ouverture}
                    onChange={(e) => handleBulkEditChange(s.jour, "heure_ouverture", e.target.value)}
                    disabled={s.est_ferme}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Fermeture</label>
                  <input
                    type="time"
                    className="w-full rounded border bg-background px-2 py-1.5 text-sm"
                    value={s.heure_fermeture}
                    onChange={(e) => handleBulkEditChange(s.jour, "heure_fermeture", e.target.value)}
                    disabled={s.est_ferme}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={s.est_ferme}
                    onChange={(e) => handleBulkEditChange(s.jour, "est_ferme", e.target.checked)}
                    className="h-4 w-4"
                  />
                  <label className="text-sm">Fermé</label>
                </div>
              </div>
            ))}
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => { setIsBulkEdit(false); setAllSchedules(null); }} disabled={isSaving}>
                Annuler
              </Button>
              <Button onClick={handleSaveBulk} disabled={isSaving}>
                {isSaving ? "Enregistrement..." : "Enregistrer tous"}
              </Button>
            </div>
          </div>
        ) : hasSchedules ? (
          <>
            <ScheduleTable
              schedules={existingSchedules}
              onEdit={setEditingSchedule}
            />
            {editingSchedule && (
              <div className="p-4">
                <ScheduleForm
                  schedule={{
                    jour: editingSchedule.jour,
                    heure_ouverture: editingSchedule.heure_ouverture,
                    heure_fermeture: editingSchedule.heure_fermeture,
                    est_ferme: editingSchedule.est_ferme,
                  }}
                  onSave={handleSaveSingle}
                  onCancel={() => setEditingSchedule(null)}
                  isSaving={isSaving}
                />
              </div>
            )}
          </>
        ) : null}
      </SectionCard>
    </PageContainer>
  );
}
