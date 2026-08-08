"use client";
import { useMemo, useState } from "react";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { useMyStructureId } from "@/features/shared/dashboard/hooks/useMyStructureId";
import {
  useInventaires,
  useTelechargerInventaire,
} from "@/features/inventaire/hooks/useInventaire";
import { Inventaire } from "@/features/inventaire/types/inventaire";
import { GenererInventaireButton } from "@/features/inventaire/components/GenererInventaireButton";
import { InventaireListTable } from "@/features/inventaire/components/InventaireListTable";
import { InventaireDetailDialog } from "@/features/inventaire/components/InventaireDetailDialog";

export default function InventairePage() {
  const { data: structureId } = useMyStructureId();
  const { data: inventaires, isLoading, error } = useInventaires(
    structureId ?? ""
  );

  const telechargerPdf = useTelechargerInventaire("pdf", "inventaire.pdf");
  const telechargerExcel = useTelechargerInventaire(
    "excel",
    "inventaire.xlsx"
  );

  const [pdfEnCours, setPdfEnCours] = useState<string | null>(null);
  const [excelEnCours, setExcelEnCours] = useState<string | null>(null);
  const [detail, setDetail] = useState<Inventaire | null>(null);

  const structureNom = useMemo(
    () => inventaires?.[0]?.structure_nom ?? "Pharmacie",
    [inventaires]
  );

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
        title="Inventaire"
        subtitle="Photographie du stock de la pharmacie à un instant donné — document historique"
        actions={
          <GenererInventaireButton
            structureId={structureId ?? ""}
            onGenerated={(id) =>
              setDetail(
                inventaires?.find((inv) => inv.id === id) ?? null
              )
            }
          />
        }
      />

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

      <InventaireDetailDialog
        open={detail !== null}
        onOpenChange={(open) => !open && setDetail(null)}
        inventaireId={detail?.id ?? null}
        numero={detail?.numero ?? ""}
        structureNom={structureNom}
      />
    </PageContainer>
  );
}
