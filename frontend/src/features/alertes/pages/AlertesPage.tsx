"use client";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { useMyStructureId } from "@/features/shared/dashboard/hooks/useMyStructureId";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useNotifications } from "@/providers/notification.provider";
import {
  useAlertes,
  useMarquerLue,
  useResumeAlertes,
} from "@/features/alertes/hooks/useAlertes";
import { AlerteResume } from "@/features/alertes/components/AlerteResume";
import { AlerteFiltres } from "@/features/alertes/components/AlerteFiltres";
import { AlerteListe } from "@/features/alertes/components/AlerteListe";
import { AlerteDetailDialog } from "@/features/alertes/components/AlerteDetailDialog";
import {
  Alerte,
  FiltreAlerte,
} from "@/features/alertes/types/alerte";

export default function AlertesPage() {
  const { data: structureId } = useMyStructureId();
  const user = useAuthStore((state) => state.user);
  const role = user?.role ?? "GESTIONNAIRE";
  const { markAllRead } = useNotifications();

  const [recherche, setRecherche] = useState("");
  const [rechercheAppliquee, setRechercheAppliquee] = useState("");
  const [filtre, setFiltre] = useState<FiltreAlerte>("");
  const [detail, setDetail] = useState<Alerte | null>(null);

  const marquerLue = useMarquerLue();

  useEffect(() => {
    const timer = setTimeout(() => setRechercheAppliquee(recherche.trim()), 400);
    return () => clearTimeout(timer);
  }, [recherche]);

  useEffect(() => {
    markAllRead("alertes");
  }, [markAllRead]);

  const { data: alertes, isLoading, error } = useAlertes(structureId ?? "", {
    recherche: rechercheAppliquee,
    filtre,
  });
  const { data: resume } = useResumeAlertes(structureId ?? "");

  const handleMarquerLue = (alerte: Alerte) => {
    if (alerte.est_lue || alerte.est_resolue) return;
    marquerLue.mutate(alerte.id, {
      onSuccess: (maj) => setDetail((actuelle) => maj ?? actuelle),
    });
  };

  return (
    <PageContainer>
      <PageTitle
        title="Alertes"
        subtitle="Surveillance automatique des situations nécessitant une intervention"
      />

      <SectionCard title="Résumé">
        {resume && <AlerteResume resume={resume} />}
      </SectionCard>

      <SectionCard title="Alertes">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Bell className="h-4 w-4" />
              Alertes générées automatiquement par le système.
            </p>
          </div>

          <AlerteFiltres
            recherche={recherche}
            onRecherche={setRecherche}
            filtre={filtre}
            onFiltre={setFiltre}
            showRechercheUtilisateur={false}
            rechercheUtilisateur=""
            onRechercheUtilisateur={() => undefined}
          />

          {isLoading && (
            <p className="p-4 text-sm text-muted-foreground">Chargement...</p>
          )}
          {error && (
            <p className="p-4 text-sm text-destructive">
              Erreur de chargement des alertes.
            </p>
          )}
          {alertes && (
            <AlerteListe alertes={alertes} role={role} onConsulter={setDetail} />
          )}
        </div>
      </SectionCard>

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
