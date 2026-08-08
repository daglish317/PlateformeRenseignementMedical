"use client";
import { useEffect, useState } from "react";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { useMyStructureId } from "@/features/shared/dashboard/hooks/useMyStructureId";
import { useEvenements, useResumeHistorique } from "@/features/historique/hooks/useHistorique";
import { HistoriqueFiltres } from "@/features/historique/components/HistoriqueFiltres";
import { HistoriqueListe } from "@/features/historique/components/HistoriqueListe";
import { HistoriqueDetailDialog } from "@/features/historique/components/HistoriqueDetailDialog";
import { HistoriqueResume } from "@/features/historique/components/HistoriqueResume";
import { EvenementHistorique, PeriodeHistorique } from "@/features/historique/types/historique";

export default function HistoriquePage() {
  const { data: structureId } = useMyStructureId();

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

  const { data: evenements, isLoading, error } = useEvenements(structureId ?? "", {
    recherche: rechercheAppliquee,
    type,
    periode,
    date_debut: dateDebut,
    date_fin: dateFin,
  });

  const { data: resume } = useResumeHistorique(structureId ?? "");

  return (
    <PageContainer>
      <PageTitle
        title="Historique"
        subtitle="Journal de traçabilité des événements majeurs de la pharmacie"
      />

      <SectionCard title="Résumé">
        {resume && <HistoriqueResume resume={resume} />}
      </SectionCard>

      <SectionCard title="Journal des événements">
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
            <HistoriqueListe evenements={evenements} onConsulter={setDetail} />
          )}
        </div>
      </SectionCard>

      <HistoriqueDetailDialog
        open={detail !== null}
        onOpenChange={(open) => !open && setDetail(null)}
        evenement={detail}
      />
    </PageContainer>
  );
}
