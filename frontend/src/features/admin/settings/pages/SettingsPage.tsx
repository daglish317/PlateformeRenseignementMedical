"use client";

import { AdminPageTitle } from "../../shared/components/AdminPageTitle";
import { AdminLoading } from "../../shared/components/AdminLoading";
import { AdminError } from "../../shared/components/AdminError";
import { useProfile } from "../hooks/useProfile";
import { ProfileCard } from "../components/ProfileCard";
import { PasswordForm } from "../components/PasswordForm";
import { PreferencesForm } from "../components/PreferencesForm";

export function SettingsPage() {
  const { data: profile, isLoading, isError, refetch } = useProfile();

  if (isLoading) {
    return <AdminLoading label="Chargement des paramètres..." />;
  }

  if (isError || !profile) {
    return (
      <AdminError
        message="Impossible de charger votre profil."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Paramètres"
        subtitle="Profil et préférences administrateur"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileCard profile={profile} />
        <PreferencesForm />
      </div>

      <PasswordForm />
    </div>
  );
}
