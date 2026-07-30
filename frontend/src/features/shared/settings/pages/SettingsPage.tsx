"use client";

import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { Button } from "@/components/ui/button";
import { useProfile } from "../hooks/useProfile";
import { ProfileCard } from "../components/ProfileCard";
import { PreferencesForm } from "../components/PreferencesForm";
import { PasswordForm } from "../components/PasswordForm";

export function SettingsPage() {
  const { data: profile, isLoading, isError, refetch } = useProfile();

  if (isLoading) {
    return (
      <PageContainer>
        <PageTitle title="Paramètres" subtitle="Chargement..." />
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </PageContainer>
    );
  }

  if (isError || !profile) {
    return (
      <PageContainer>
        <PageTitle title="Paramètres" subtitle="Erreur" />
        <div className="rounded-xl border bg-card p-6 text-center">
          <p className="text-muted-foreground mb-4">Impossible de charger votre profil.</p>
          <Button onClick={() => refetch()}>Réessayer</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageTitle title="Paramètres" subtitle="Profil et préférences" />

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileCard profile={profile} />
        <PreferencesForm />
      </div>

      <PasswordForm />
    </PageContainer>
  );
}
