"use client";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { useTechnicalPlatforms } from "../hooks/useTechnicalPlatforms";
import { useCreateTechnicalPlatform } from "../hooks/useCreateTechnicalPlatform";
import { useDeleteTechnicalPlatform } from "../hooks/useDeleteTechnicalPlatform";
import { TechnicalPlatformTable } from "../components/TechnicalPlatformTable";
import { TechnicalPlatformForm } from "../components/TechnicalPlatformForm";

const STRUCTURE_ID = "placeholder-structure-id";

export default function TechnicalPlatformsPage() {
  const { platforms, catalogues } = useTechnicalPlatforms(STRUCTURE_ID);
  const createMutation = useCreateTechnicalPlatform(STRUCTURE_ID);
  const deleteMutation = useDeleteTechnicalPlatform(STRUCTURE_ID);

  return (
    <PageContainer>
      <PageTitle title="Plateaux techniques" subtitle="Gérer les plateaux techniques de la structure" />
      <SectionCard title="Ajouter un plateau technique">
        <TechnicalPlatformForm
          catalogues={catalogues.data ?? []}
          onSubmit={(id) => createMutation.mutate(id)}
          isSubmitting={createMutation.isPending}
        />
      </SectionCard>
      <SectionCard title="Liste des plateaux techniques">
        {platforms.isLoading && <p>Chargement...</p>}
        {platforms.isError && <p className="text-destructive">Erreur de chargement</p>}
        {platforms.data && (
          <TechnicalPlatformTable
            platforms={platforms.data}
            onDelete={(id) => deleteMutation.mutate(id)}
            isDeleting={deleteMutation.isPending}
          />
        )}
      </SectionCard>
    </PageContainer>
  );
}
