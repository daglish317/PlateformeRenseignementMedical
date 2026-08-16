"use client";

import { useMemo, useState } from "react";
import { Building2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { useOwnerStructures } from "@/features/shared/owner-structures/hooks/useOwnerStructures";

export default function OwnerCaissePage() {
  const { data, isLoading } = useOwnerStructures();
  const pharmacies = useMemo(
    () => (data?.results ?? []).filter((structure) => structure.type === "PHARMACIE"),
    [data]
  );
  const [structureId, setStructureId] = useState("");
  const selectedStructureId = structureId || pharmacies[0]?.id || "";

  return (
    <PageContainer className="space-y-6">
      <PageTitle
        title="Supervision caisse"
        subtitle="Consulter les ventes, paiements, retours et historiques de vos pharmacies"
      />

      <SectionCard title="Pharmacie">
        {isLoading ? (
          <p className="p-2 text-sm text-muted-foreground">Chargement...</p>
        ) : pharmacies.length === 0 ? (
          <p className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            Aucune pharmacie disponible.
          </p>
        ) : (
          <div className="max-w-sm space-y-2">
            <Label htmlFor="owner-caisse-structure">Structure</Label>
            <Select
              id="owner-caisse-structure"
              value={selectedStructureId}
              onChange={(event) => setStructureId(event.target.value)}
            >
              {pharmacies.map((structure) => (
                <option key={structure.id} value={structure.id}>
                  {structure.nom}
                </option>
              ))}
            </Select>
          </div>
        )}
      </SectionCard>

      {selectedStructureId ? (
        <SectionCard title="Caisse">
          <div className="rounded-lg border border-border bg-muted/30 p-8 text-center">
            <p className="text-muted-foreground">
              Module Caisse - En cours d'implémentation
            </p>
          </div>
        </SectionCard>
      ) : null}
    </PageContainer>
  );
}
