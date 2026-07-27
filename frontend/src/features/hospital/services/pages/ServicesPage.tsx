"use client";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { useServices } from "../hooks/useServices";
import { useCreateService } from "../hooks/useCreateService";
import { useDeleteService } from "../hooks/useDeleteService";
import { ServiceTable } from "../components/ServiceTable";
import { ServiceForm } from "../components/ServiceForm";
import { useMyStructureId } from "@/features/shared/dashboard/hooks/useMyStructureId";

export default function ServicesPage() {
  const { data: structureId } = useMyStructureId();
  const { services, catalogues } = useServices(structureId ?? "");
  const createMutation = useCreateService(structureId ?? "");
  const deleteMutation = useDeleteService(structureId ?? "");

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
