"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { useCareServices } from "../hooks/useCareServices";
import { useCreateCareService } from "../hooks/useCreateCareService";
import { useDeleteCareService } from "../hooks/useDeleteCareService";
import { CareServiceTable } from "../components/CareServiceTable";
import { CareServiceForm } from "../components/CareServiceForm";
import { ImportCareServiceDialog } from "../components/ImportCareServiceDialog";
import { useMyStructureId } from "@/features/shared/dashboard/hooks/useMyStructureId";

export default function CareServicesPage() {
  const [search, setSearch] = useState("");
  const { data: structureId } = useMyStructureId();
  const { careServices } = useCareServices(structureId ?? "");
  const createMutation = useCreateCareService(structureId ?? "");
  const deleteMutation = useDeleteCareService(structureId ?? "");

  const filtered = careServices.data?.filter((c) =>
    c.service.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <PageTitle title="Prises en charge" subtitle="Gérer les prises en charge de la structure" />
        <ImportCareServiceDialog structureId={structureId ?? ""} />
      </div>
      <SectionCard title="Ajouter une prise en charge">
        <CareServiceForm
          onSubmit={(nom) => createMutation.mutate(nom)}
          isSubmitting={createMutation.isPending}
        />
      </SectionCard>
      <SectionCard title="Liste des prises en charge">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {careServices.isLoading && <p>Chargement...</p>}
        {careServices.isError && <p className="text-destructive">Erreur de chargement</p>}
        {filtered && (
          <CareServiceTable
            careServices={filtered}
            onDelete={(id) => deleteMutation.mutate(id)}
            isDeleting={deleteMutation.isPending}
          />
        )}
      </SectionCard>
    </PageContainer>
  );
}
