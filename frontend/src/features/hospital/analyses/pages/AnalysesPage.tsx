"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { useAnalyses } from "../hooks/useAnalyses";
import { useCreateAnalysis } from "../hooks/useCreateAnalysis";
import { useDeleteAnalysis } from "../hooks/useDeleteAnalysis";
import { AnalysisTable } from "../components/AnalysisTable";
import { AnalysisForm } from "../components/AnalysisForm";
import { ImportAnalysisDialog } from "../components/ImportAnalysisDialog";
import { useMyStructureId } from "@/features/shared/dashboard/hooks/useMyStructureId";

export default function AnalysesPage() {
  const [search, setSearch] = useState("");
  const { data: structureId } = useMyStructureId();
  const { analyses } = useAnalyses(structureId ?? "");
  const createMutation = useCreateAnalysis(structureId ?? "");
  const deleteMutation = useDeleteAnalysis(structureId ?? "");

  const filtered = analyses.data?.filter((a) =>
    a.service.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <PageTitle title="Analyses" subtitle="Gérer les analyses de la structure" />
        <ImportAnalysisDialog structureId={structureId ?? ""} />
      </div>
      <SectionCard title="Ajouter une analyse">
        <AnalysisForm
          onSubmit={(nom) => createMutation.mutate(nom)}
          isSubmitting={createMutation.isPending}
        />
      </SectionCard>
      <SectionCard title="Liste des analyses">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {analyses.isLoading && <p>Chargement...</p>}
        {analyses.isError && <p className="text-destructive">Erreur de chargement</p>}
        {filtered && (
          <AnalysisTable
            analyses={filtered}
            onDelete={(id) => deleteMutation.mutate(id)}
            isDeleting={deleteMutation.isPending}
          />
        )}
      </SectionCard>
    </PageContainer>
  );
}
