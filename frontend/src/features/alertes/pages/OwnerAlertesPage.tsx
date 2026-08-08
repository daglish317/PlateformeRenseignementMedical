"use client";
import { useEffect, useMemo, useState } from "react";
import { Bell, Building2, FileSpreadsheet, FileText } from "lucide-react";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useOwnerStructures } from "@/features/shared/owner-structures/hooks/useOwnerStructures";
import { useAuthStore } from "@/features/auth/store/auth-store";
import {
  useAlertes,
  useMarquerLue,
  useResumeAlertes,
  useTelechargerAlertes,
} from "@/features/alertes/hooks/useAlertes";
import { AlerteResume } from "@/features/alertes/components/AlerteResume";
import { AlerteFiltres } from "@/features/alertes/components/AlerteFiltres";
import { AlerteListe } from "@/features/alertes/components/AlerteListe";
import { AlerteDetailDialog } from "@/features/alertes/components/AlerteDetailDialog";
import {
  Alerte,
  FiltreAlerte,
} from "@/features/alertes/types/alerte";

export default function OwnerAlertesPage() {
  const { data, isLoading: structuresEnChargement } = useOwnerStructures();
  const pharmacies = useMemo(
    () => (data?.results ?? []).filter((s) => s.type === "PHARMACIE"),
    [data]
  );
  const user = useAuthStore((state) => state.user);
  const role = user?.role ?? "PROPRIETAIRE";

  const [structureId, setStructureId] = useState("");
  const structureSelectionnee = structureId || pharmacies[0]?.id || "";

  const [recherche, setRecherche] = useState("");
  const [rechercheAppliquee, setRechercheAppliquee] = useState("");
  const [rechercheUtilisateur, setRechercheUtilisateur] = useState("");
  const [rechercheUtilisateurAppliquee, setRechercheUtilisateurAppliquee] =
    useState("");
  const [filtre, setFiltre] = useState<FiltreAlerte>("");
  const [detail, setDetail] = useState<Alerte | null>(null);

  const marquerLue = useMarquerLue();

  useEffect(() => {
    const timer = setTimeout(() => setRechercheAppliquee(recherche.trim()), 400);
    return () => clearTimeout(timer);
  }, [recherche]);

  useEffect(() => {
    const timer = setTimeout(
      () => setRechercheUtilisateurAppliquee(rechercheUtilisateur.trim()),
      400
    );
    return () => clearTimeout(timer);
  }, [rechercheUtilisateur]);

  const filtres = {
    recherche: rechercheAppliquee,
    filtre,
    recherche_utilisateur: rechercheUtilisateurAppliquee,
  };

  const { data: alertes, isLoading, error } = useAlertes(
    structureSelectionnee,
    filtres
  );
  const { data: resume } = useResumeAlertes(structureSelectionnee);

  const telechargerPdf = useTelechargerAlertes("pdf", "alertes.pdf");
  const telechargerExcel = useTelechargerAlertes("excel", "alertes.xlsx");

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

  const handleMarquerLue = (alerte: Alerte) => {
    if (alerte.est_lue || alerte.est_resolue) return;
    marquerLue.mutate(alerte.id, {
      onSuccess: (maj) => setDetail((actuelle) => maj ?? actuelle),
    });
  };

  return (
    <PageContainer>
      <PageTitle
        title="Alertes des pharmacies"
        subtitle="Surveillance et supervision des situations nécessitant une analyse"
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
            <Label htmlFor="structure-alertes">Structure</Label>
            <Select
              id="structure-alertes"
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
            {resume && <AlerteResume resume={resume} />}
          </SectionCard>

          <SectionCard
            title="Alertes"
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
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Bell className="h-4 w-4" />
                Alertes générées automatiquement par le système.
              </p>

              <AlerteFiltres
                recherche={recherche}
                onRecherche={setRecherche}
                filtre={filtre}
                onFiltre={setFiltre}
                showRechercheUtilisateur
                rechercheUtilisateur={rechercheUtilisateur}
                onRechercheUtilisateur={setRechercheUtilisateur}
              />

              {isLoading && (
                <p className="p-4 text-sm text-muted-foreground">
                  Chargement...
                </p>
              )}
              {error && (
                <p className="p-4 text-sm text-destructive">
                  Erreur de chargement des alertes.
                </p>
              )}
              {alertes && (
                <AlerteListe
                  alertes={alertes}
                  role={role}
                  onConsulter={setDetail}
                />
              )}
            </div>
          </SectionCard>
        </>
      )}

      <AlerteDetailDialog
        open={detail !== null}
        onOpenChange={(open) => !open && setDetail(null)}
        alerte={detail}
        role={role}
        marquageEnCours={marquerLue.isPending}
        onMarquerLue={handleMarquerLue}
      />
    </PageContainer>
  );
}
