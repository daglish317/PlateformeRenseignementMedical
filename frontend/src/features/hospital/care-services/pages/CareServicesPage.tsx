"use client";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { useCareServices } from "../hooks/useCareServices";
import { useCreateCareService } from "../hooks/useCreateCareService";
import { useDeleteCareService } from "../hooks/useDeleteCareService";
import { CareServiceTable } from "../components/CareServiceTable";
import { CareServiceForm } from "../components/CareServiceForm";

const STRUCTURE_ID = "placeholder-structure-id";

export default function CareServicesPage() {
  const { careServices, catalogues } = useCareServices(STRUCTURE_ID);
  const createMutation = useCreateCareService(STRUCTURE_ID);
  const deleteMutation = useDeleteCareService(STRUCTURE_ID);

  return (
    <PageContainer>
      <PageTitle title="Prises en charge" subtitle="Gérer les prises en charge de la structure" />
      <SectionCard title="Ajouter une prise en charge">
        <CareServiceForm
          catalogues={catalogues.data ?? []}
          onSubmit={(id) => createMutation.mutate(id)}
          isSubmitting={createMutation.isPending}
        />
      </SectionCard>
      <SectionCard title="Liste des prises en charge">
        {careServices.isLoading && <p>Chargement...</p>}
        {careServices.isError && <p className="text-destructive">Erreur de chargement</p>}
        {careServices.data && (
          <CareServiceTable
            careServices={careServices.data}
            onDelete={(id) => deleteMutation.mutate(id)}
            isDeleting={deleteMutation.isPending}
          />
        )}
      </SectionCard>
    </PageContainer>
  );
}
