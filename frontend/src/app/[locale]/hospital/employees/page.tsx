"use client";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";

export default function HospitalEmployeesPage() {
  return (
    <PageContainer>
      <PageTitle title="Personnel" subtitle="Gérer le personnel de la structure" />
      <SectionCard title="Liste du personnel">
        <p className="text-muted-foreground p-4">Module en cours de développement</p>
      </SectionCard>
    </PageContainer>
  );
}
