"use client";
import { useEffect, useMemo, useState } from "react";
import { Building2, FileSpreadsheet, FileText } from "lucide-react";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useOwnerStructures } from "@/features/shared/owner-structures/hooks/useOwnerStructures";
import {
  useEvenements,
  useResumeHistorique,
  useTelechargerHistorique,
} from "@/features/historique/hooks/useHistorique";
import { HistoriqueFiltres } from "@/features/historique/components/HistoriqueFiltres";
import { HistoriqueListe } from "@/features/historique/components/HistoriqueListe";
import { HistoriqueDetailDialog } from "@/features/historique/components/HistoriqueDetailDialog";
import { HistoriqueResume } from "@/features/historique/components/HistoriqueResume";
import {
  EvenementHistorique,
  PeriodeHistorique,
} from "@/features/historique/types/historique";

export default function OwnerHistoriquePage() {
  const { data, isLoading: structuresEnChargement } = useOwnerStructures();
  const pharmacies = useMemo(
    () => (data?.results ?? []).filter((s) => s.type === "PHARMACIE"),
    [data]
  );

  const [structureId, setStructureId] = useState("");
  const structureSelectionnee = structureId || pharmacies[0]?.id || "";

  const [recherche, setRecherche] = useState("");
  const [rechercheAppliquee, setRechercheAppliquee] = useState("");
  const [periode, setPeriode] = useState<PeriodeHistorique>("");
  const [type, setType] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [detail, setDetail] = useState<EvenementHistorique | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setRechercheAppliquee(recherche.trim()), 400);
    return () => clearTimeout(timer);
  }, [recherche]);

  const filtres = {
    recherche: rechercheAppliquee,
    type,
    periode,
    date_debut: dateDebut,
    date_fin: dateFin,
  };

  const { data: evenements, isLoading, error } = useEvenements(
    structureSelectionnee,
    filtres
  );
  const { data: resume } = useResumeHistorique(structureSelectionnee);

  const telechargerPdf = useTelechargerHistorique(
    "pdf",
    "historique.pdf"
  );
  const telechargerExcel = useTelechargerHistorique(
    "excel",
    "historique.xlsx"
  );

  const handlePdf = () => {
    telechargerPdf.mutate({
      structureId: structureSelectionnee,
      filtres,
    });
  };

  const handleExcel = () => {
    telechargerExcel.mutate({
      structureId: structureSelectionnee,
      filtres,
    });
  };

  return (
    <PageContainer>
      <PageTitle
        title="Historique des pharmacies"
        subtitle="Journal de traçabilité des événements majeurs de vos pharmacies"
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
            <Label htmlFor="structure-historique">Structure</Label>
            <Select
              id="structure-historique"
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
        <>
          <SectionCard title="Résumé">
            {resume && <HistoriqueResume resume={resume} />}
          </SectionCard>

          <SectionCard
            title="Journal des événements"
            actions={
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePdf}
                  disabled={telechargerPdf.isPending}
                >
                  <FileText className="h-4 w-4" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExcel}
                  disabled={telechargerExcel.isPending}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              <HistoriqueFiltres
                recherche={recherche}
                onRecherche={setRecherche}
                periode={periode}
                onPeriode={setPeriode}
                type={type}
                onType={setType}
                dateDebut={dateDebut}
                onDateDebut={setDateDebut}
                dateFin={dateFin}
                onDateFin={setDateFin}
              />

              {isLoading && (
                <p className="p-4 text-sm text-muted-foreground">Chargement...</p>
              )}
              {error && (
                <p className="p-4 text-sm text-destructive">
                  Erreur de chargement de l&apos;historique.
                </p>
              )}
              {evenements && (
                <HistoriqueListe
                  evenements={evenements}
                  onConsulter={setDetail}
                />
              )}
            </div>
          </SectionCard>
        </>
      )}

      <HistoriqueDetailDialog
        open={detail !== null}
        onOpenChange={(open) => !open && setDetail(null)}
        evenement={detail}
      />
    </PageContainer>
  );
}
