"use client";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";

export default function PharmacyMedicationsPage() {
  return (
    <PageContainer>
      <PageTitle title="Médicaments" subtitle="Gérer les médicaments de la pharmacie" />
      <SectionCard title="Catalogue de médicaments">
        <p className="text-muted-foreground p-4">Module en cours de développement</p>
      </SectionCard>
    </PageContainer>
  );
}
