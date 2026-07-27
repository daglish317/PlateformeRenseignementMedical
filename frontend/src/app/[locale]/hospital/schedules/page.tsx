"use client";
import { SchedulesPage } from "@/features/shared/schedules/pages/SchedulesPage";
import { useMyStructureId } from "@/features/shared/dashboard/hooks/useMyStructureId";

export default function HospitalSchedulesPage() {
  const { data: structureId, isLoading } = useMyStructureId();
  if (isLoading || !structureId) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  return <SchedulesPage structureId={structureId} />;
}
