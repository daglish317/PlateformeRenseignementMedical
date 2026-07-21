"use client";

import { useState } from "react";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { useSchedules } from "../hooks/useSchedules";
import { useCreateSchedules } from "../hooks/useCreateSchedules";
import { Schedule, SchedulePayload } from "../types/schedule";
import { ScheduleTable } from "../components/ScheduleTable";
import { ScheduleForm } from "../components/ScheduleForm";

interface SchedulesPageProps {
  structureId: string;
}

export function SchedulesPage({ structureId }: SchedulesPageProps) {
  const { data: schedules, isLoading, error } = useSchedules(structureId);
  const { mutate: saveSchedules, isPending: isSaving } =
    useCreateSchedules(structureId);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const handleSave = (payload: SchedulePayload) => {
    if (!schedules?.data) return;
    const updated = schedules.data.map((s) =>
      s.jour === payload.jour ? payload : {
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

  return (
    <PageContainer>
      <PageTitle title="Horaires" subtitle="Gérez les horaires d'ouverture." />

      <SectionCard title="Horaires d'ouverture">
        {isLoading && <p className="text-muted-foreground p-4">Chargement...</p>}
        {error && (
          <p className="text-destructive p-4">
            Erreur lors du chargement des horaires.
          </p>
        )}
        {schedules?.data && (
          <>
            <ScheduleTable
              schedules={schedules.data}
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
                  onSave={handleSave}
                  onCancel={() => setEditingSchedule(null)}
                  isSaving={isSaving}
                />
              </div>
            )}
          </>
        )}
      </SectionCard>
    </PageContainer>
  );
}
