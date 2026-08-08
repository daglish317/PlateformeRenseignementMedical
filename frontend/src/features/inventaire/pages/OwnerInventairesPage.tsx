"use client";
import { useMemo, useState } from "react";
import { Building2 } from "lucide-react";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useOwnerStructures } from "@/features/shared/owner-structures/hooks/useOwnerStructures";
import {
  useInventaires,
  useTelechargerInventaire,
} from "@/features/inventaire/hooks/useInventaire";
import { Inventaire } from "@/features/inventaire/types/inventaire";
import { InventaireListTable } from "@/features/inventaire/components/InventaireListTable";
import { InventaireDetailDialog } from "@/features/inventaire/components/InventaireDetailDialog";

export default function OwnerInventairesPage() {
  const { data, isLoading: structuresEnChargement } = useOwnerStructures();
  const pharmacies = useMemo(
    () => (data?.results ?? []).filter((s) => s.type === "PHARMACIE"),
    [data]
  );

  const [structureId, setStructureId] = useState("");
  const structureSelectionnee =
    structureId || pharmacies[0]?.id || "";

  const structureNom = useMemo(
    () =>
      pharmacies.find((s) => s.id === structureSelectionnee)?.nom ??
      "Pharmacie",
    [pharmacies, structureSelectionnee]
  );

  const { data: inventaires, isLoading, error } = useInventaires(
    structureSelectionnee
  );

  const telechargerPdf = useTelechargerInventaire("pdf", "inventaire.pdf");
  const telechargerExcel = useTelechargerInventaire(
    "excel",
    "inventaire.xlsx"
  );

  const [pdfEnCours, setPdfEnCours] = useState<string | null>(null);
  const [excelEnCours, setExcelEnCours] = useState<string | null>(null);
  const [detail, setDetail] = useState<Inventaire | null>(null);

  const handlePdf = (inventaire: Inventaire) => {
    setPdfEnCours(inventaire.id);
    telechargerPdf.mutate(inventaire.id, {
      onSettled: () => setPdfEnCours(null),
    });
  };

  const handleExcel = (inventaire: Inventaire) => {
    setExcelEnCours(inventaire.id);
    telechargerExcel.mutate(inventaire.id, {
      onSettled: () => setExcelEnCours(null),
    });
  };

  return (
    <PageContainer>
      <PageTitle
        title="Inventaires des pharmacies"
        subtitle="Consultez les états du stock de vos pharmacies et téléchargez les rapports"
      />

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
            <Label htmlFor="structure-inventaire">Structure</Label>
            <Select
              id="structure-inventaire"
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

      {structureSelectionnee && (
        <SectionCard title="Historique des inventaires">
          {isLoading && (
            <p className="p-4 text-sm text-muted-foreground">Chargement...</p>
          )}
          {error && (
            <p className="p-4 text-sm text-destructive">
              Erreur de chargement des inventaires.
            </p>
          )}
          {inventaires && (
            <InventaireListTable
              inventaires={inventaires}
              onConsulter={setDetail}
              onTelechargerPdf={handlePdf}
              onTelechargerExcel={handleExcel}
              pdfEnCours={pdfEnCours}
              excelEnCours={excelEnCours}
            />
          )}
        </SectionCard>
      )}

      <InventaireDetailDialog
        open={detail !== null}
        onOpenChange={(open) => !open && setDetail(null)}
        inventaireId={detail?.id ?? null}
        numero={detail?.numero ?? ""}
        structureNom={detail?.structure_nom ?? structureNom}
      />
    </PageContainer>
  );
}
