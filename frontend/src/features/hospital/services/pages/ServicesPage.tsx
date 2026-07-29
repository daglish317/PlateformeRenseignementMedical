"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { useServices } from "../hooks/useServices";
import { useCreateService } from "../hooks/useCreateService";
import { useDeleteService } from "../hooks/useDeleteService";
import { ServiceTable } from "../components/ServiceTable";
import { ServiceForm } from "../components/ServiceForm";
import { ImportServiceDialog } from "../components/ImportServiceDialog";
import { useMyStructureId } from "@/features/shared/dashboard/hooks/useMyStructureId";

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const { data: structureId } = useMyStructureId();
  const { services } = useServices(structureId ?? "");
  const createMutation = useCreateService(structureId ?? "");
  const deleteMutation = useDeleteService(structureId ?? "");

  const filtered = services.data?.filter((s) =>
    s.service.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <PageTitle title="Services médicaux" subtitle="Gérer les services de la structure" />
        <ImportServiceDialog structureId={structureId ?? ""} />
      </div>
      <SectionCard title="Ajouter un service">
        <ServiceForm
          onSubmit={(nom) => createMutation.mutate(nom)}
          isSubmitting={createMutation.isPending}
        />
      </SectionCard>
      <SectionCard title="Liste des services">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {services.isLoading && <p>Chargement...</p>}
        {services.isError && <p className="text-destructive">Erreur de chargement</p>}
        {filtered && (
          <ServiceTable
            services={filtered}
            onDelete={(id) => deleteMutation.mutate(id)}
            isDeleting={deleteMutation.isPending}
          />
        )}
      </SectionCard>
    </PageContainer>
  );
}
