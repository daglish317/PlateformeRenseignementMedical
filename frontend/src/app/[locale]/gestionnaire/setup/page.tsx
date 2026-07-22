"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { StructureSetupForm } from "@/features/gestionnaire/components/StructureSetupForm";
import PublicLayout from "@/components/layout/PublicLayout";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthCard } from "@/features/auth/components/AuthCard";

export default function GestionnaireSetupPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const authenticated = useAuthStore((s) => s.authenticated);

  useEffect(() => {
    if (!authenticated) {
      router.replace("/connexion");
    }
  }, [authenticated, router]);

  if (!authenticated || !user) {
    return null;
  }

  return (
    <PublicLayout showSearch={false} showFooter={true}>
      <AuthLayout>
        <AuthCard title="Configuration de votre structure">
          <StructureSetupForm onComplete={() => router.replace("/gestionnaire")} />
        </AuthCard>
      </AuthLayout>
    </PublicLayout>
  );
}
