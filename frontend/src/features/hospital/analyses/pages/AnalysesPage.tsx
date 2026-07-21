"use client";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { useAnalyses } from "../hooks/useAnalyses";
import { useCreateAnalysis } from "../hooks/useCreateAnalysis";
import { useDeleteAnalysis } from "../hooks/useDeleteAnalysis";
import { AnalysisTable } from "../components/AnalysisTable";
import { AnalysisForm } from "../components/AnalysisForm";

const STRUCTURE_ID = "placeholder-structure-id";

export default function AnalysesPage() {
  const { analyses, catalogues } = useAnalyses(STRUCTURE_ID);
  const createMutation = useCreateAnalysis(STRUCTURE_ID);
  const deleteMutation = useDeleteAnalysis(STRUCTURE_ID);

  return (
    <PageContainer>
      <PageTitle title="Analyses" subtitle="Gérer les analyses de la structure" />
      <SectionCard title="Ajouter une analyse">
        <AnalysisForm
          catalogues={catalogues.data ?? []}
          onSubmit={(id) => createMutation.mutate(id)}
          isSubmitting={createMutation.isPending}
        />
      </SectionCard>
      <SectionCard title="Liste des analyses">
        {analyses.isLoading && <p>Chargement...</p>}
        {analyses.isError && <p className="text-destructive">Erreur de chargement</p>}
        {analyses.data && (
          <AnalysisTable
            analyses={analyses.data}
            onDelete={(id) => deleteMutation.mutate(id)}
            isDeleting={deleteMutation.isPending}
          />
        )}
      </SectionCard>
    </PageContainer>
  );
}
