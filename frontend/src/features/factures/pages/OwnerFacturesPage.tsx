"use client";
import { useMemo } from "react";
import { Building2 } from "lucide-react";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useOwnerStructureSelector } from "@/features/shared/owner-structures/hooks/useOwnerStructureSelector";
import { FacturesExplorer } from "@/features/factures/components/FacturesExplorer";

export default function OwnerFacturesPage() {
  const { structureId: structureSelectionnee, pharmacies, isLoading: structuresEnChargement, setStructureId } = useOwnerStructureSelector();

  const structureNom = useMemo(
    () =>
      pharmacies.find((s) => s.id === structureSelectionnee)?.nom ??
      "Pharmacie",
    [pharmacies, structureSelectionnee]
  );

  return (
    <PageContainer>
      <SectionCard title="Pharmacie concernée">
        {structuresEnChargement ? (
          <p className="p-2 text-sm text-muted-foreground">Chargement...</p>
        ) : pharmacies.length === 0 ? (
          <p className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            Vous n&apos;avez aucune pharmacie pour le moment.
          </p>
        ) : (
          <div className="max-w-sm space-y-2">
            <Label htmlFor="structure-factures">Structure</Label>
            <Select
              id="structure-factures"
              value={structureSelectionnee}
              onChange={(e) => setStructureId(e.target.value)}
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

      {structureSelectionnee ? (
        <FacturesExplorer
          structureId={structureSelectionnee}
          structureNom={structureNom}
        />
      ) : null}
    </PageContainer>
  );
}
