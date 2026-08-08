"use client";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { useMyStructureId } from "@/features/shared/dashboard/hooks/useMyStructureId";
import { useMedications } from "../hooks/useMedications";
import { MedicationTable } from "../components/MedicationTable";

export default function MedicationsPage() {
  const { data: structureId } = useMyStructureId();
  const { data: medications, isLoading, isError } = useMedications(structureId ?? "");

  return (
    <PageContainer>
      <PageTitle title="Médicaments" subtitle="Liste des médicaments de la pharmacie" />
      <SectionCard title="Liste des médicaments">
        {isLoading && <p>Chargement...</p>}
        {isError && <p className="text-destructive">Erreur de chargement</p>}
        {medications && <MedicationTable medications={medications} />}
      </SectionCard>
    </PageContainer>
  );
}
