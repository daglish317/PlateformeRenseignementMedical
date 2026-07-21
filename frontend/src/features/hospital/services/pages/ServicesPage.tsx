"use client";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { useServices } from "../hooks/useServices";
import { useCreateService } from "../hooks/useCreateService";
import { useDeleteService } from "../hooks/useDeleteService";
import { ServiceTable } from "../components/ServiceTable";
import { ServiceForm } from "../components/ServiceForm";

const STRUCTURE_ID = "placeholder-structure-id";

export default function ServicesPage() {
  const { services, catalogues } = useServices(STRUCTURE_ID);
  const createMutation = useCreateService(STRUCTURE_ID);
  const deleteMutation = useDeleteService(STRUCTURE_ID);

  return (
    <PageContainer>
      <PageTitle title="Services médicaux" subtitle="Gérer les services de la structure" />
      <SectionCard title="Ajouter un service">
        <ServiceForm
          catalogues={catalogues.data ?? []}
          onSubmit={(id) => createMutation.mutate(id)}
          isSubmitting={createMutation.isPending}
        />
      </SectionCard>
      <SectionCard title="Liste des services">
        {services.isLoading && <p>Chargement...</p>}
        {services.isError && <p className="text-destructive">Erreur de chargement</p>}
        {services.data && (
          <ServiceTable
            services={services.data}
            onDelete={(id) => deleteMutation.mutate(id)}
            isDeleting={deleteMutation.isPending}
          />
        )}
      </SectionCard>
    </PageContainer>
  );
}
