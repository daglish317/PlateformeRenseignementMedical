"use client";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { useMyStructureId } from "@/features/shared/dashboard/hooks/useMyStructureId";
import { useMedications } from "../hooks/useMedications";
import { MedicationTable } from "../components/MedicationTable";
import { ImportMedicationDialog } from "../components/ImportMedicationDialog";

export default function MedicationsPage() {
  const { data: structureId } = useMyStructureId();
  const { data: medications, isLoading, isError } = useMedications(structureId ?? "");

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <PageTitle title="Médicaments" subtitle="Gérer les médicaments de la pharmacie" />
        <ImportMedicationDialog structureId={structureId ?? ""} />
      </div>
      <SectionCard title="Liste des médicaments">
        {isLoading && <p>Chargement...</p>}
        {isError && <p className="text-destructive">Erreur de chargement</p>}
        {medications && <MedicationTable medications={medications} />}
      </SectionCard>
    </PageContainer>
  );
}
