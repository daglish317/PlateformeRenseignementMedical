"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { useTechnicalPlatforms } from "../hooks/useTechnicalPlatforms";
import { useCreateTechnicalPlatform } from "../hooks/useCreateTechnicalPlatform";
import { useDeleteTechnicalPlatform } from "../hooks/useDeleteTechnicalPlatform";
import { TechnicalPlatformTable } from "../components/TechnicalPlatformTable";
import { TechnicalPlatformForm } from "../components/TechnicalPlatformForm";
import { useMyStructureId } from "@/features/shared/dashboard/hooks/useMyStructureId";
import { ImportTechnicalPlatformDialog } from "../components/ImportTechnicalPlatformDialog";

export default function TechnicalPlatformsPage() {
  const [search, setSearch] = useState("");
  const { data: structureId } = useMyStructureId();
  const { platforms } = useTechnicalPlatforms(structureId ?? "");
  const createMutation = useCreateTechnicalPlatform(structureId ?? "");
  const deleteMutation = useDeleteTechnicalPlatform(structureId ?? "");

  const filtered = platforms.data?.filter((p) =>
    p.service.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <PageTitle title="Plateaux techniques" subtitle="Gérer les plateaux techniques de la structure" />
        <ImportTechnicalPlatformDialog structureId={structureId ?? ""} />
      </div>
      <SectionCard title="Ajouter un plateau technique">
        <TechnicalPlatformForm
          onSubmit={(nom) => createMutation.mutate(nom)}
          isSubmitting={createMutation.isPending}
        />
      </SectionCard>
      <SectionCard title="Liste des plateaux techniques">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {platforms.isLoading && <p>Chargement...</p>}
        {platforms.isError && <p className="text-destructive">Erreur de chargement</p>}
        {filtered && (
          <TechnicalPlatformTable
            platforms={filtered}
            onDelete={(id) => deleteMutation.mutate(id)}
            isDeleting={deleteMutation.isPending}
          />
        )}
      </SectionCard>
    </PageContainer>
  );
}
