"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { SuccessPage } from "@/features/gestionnaire/components/SuccessPage";
import PublicLayout from "@/components/layout/PublicLayout";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthCard } from "@/features/auth/components/AuthCard";

export default function GestionnaireSuccessPage() {
  const router = useRouter();
  const authenticated = useAuthStore((s) => s.authenticated);

  useEffect(() => {
    if (!authenticated) {
      router.replace("/connexion");
    }
  }, [authenticated, router]);

  if (!authenticated) return null;

  return (
    <PublicLayout showSearch={false} showFooter={true}>
      <AuthLayout>
        <AuthCard title="Structure soumise">
          <SuccessPage />
        </AuthCard>
      </AuthLayout>
    </PublicLayout>
  );
}
