"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

import PublicLayout from "@/components/layout/PublicLayout";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { SuccessPage } from "@/features/gestionnaire/components/SuccessPage";
import { useMyStructure } from "@/features/shared/structure-profile/hooks/useMyStructure";

const TYPE_TO_ROUTE: Record<string, string> = {
  HOPITAL: "hospital",
  PHARMACIE: "pharmacy",
};

export default function GestionnaireSuccessPage() {
  const router = useRouter();
  const authenticated = useAuthStore((state) => state.authenticated);
  const hydrated = useAuthStore((state) => state.hydrated);
  const { data: structure, isError } = useMyStructure(hydrated && authenticated);

  useEffect(() => {
    if (!hydrated) return;

    if (!authenticated) {
      router.replace("/connexion");
      return;
    }

    if (isError) {
      router.replace("/gestionnaire/setup");
      return;
    }

    if (!structure) return;

    if (structure.statut === "ACTIVE") {
      const route = TYPE_TO_ROUTE[structure.type.toUpperCase()] || "hospital";
      router.replace(`/${route}`);
    }
  }, [authenticated, hydrated, isError, router, structure]);

  if (!hydrated || !authenticated) return null;

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
