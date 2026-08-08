"use client";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { useMyStructureId } from "@/features/shared/dashboard/hooks/useMyStructureId";
import { ApprovisionnementForm } from "../components/ApprovisionnementForm";
import { ApprovisionnementsHistory } from "../components/ApprovisionnementsHistory";

export default function ApprovisionnementPage() {
  const { data: structureId, isLoading: structureLoading } = useMyStructureId();

  if (structureLoading) {
    return <p className="p-6 text-muted-foreground">Chargement...</p>;
  }

  if (!structureId) {
    return <p className="p-6 text-destructive">Aucune structure associée.</p>;
  }

  return (
    <PageContainer>
      <PageTitle
        title="Approvisionnement"
        subtitle="Enregistrer une livraison et augmenter le stock de la structure"
      />
      <ApprovisionnementForm structureId={structureId} />
      <SectionCard title="Historique des approvisionnements">
        <ApprovisionnementsHistory structureId={structureId} />
      </SectionCard>
    </PageContainer>
  );
}
