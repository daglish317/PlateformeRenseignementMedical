"use client";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { useMyStructureId } from "@/features/shared/dashboard/hooks/useMyStructureId";
import { FacturesExplorer } from "@/features/factures/components/FacturesExplorer";

export default function FacturePage() {
  const { data: structureId } = useMyStructureId();

  if (!structureId) {
    return (
      <PageContainer>
        <p className="text-sm text-muted-foreground">
          Chargement de la structure...
        </p>
      </PageContainer>
    );
  }

  return <FacturesExplorer structureId={structureId} />;
}
