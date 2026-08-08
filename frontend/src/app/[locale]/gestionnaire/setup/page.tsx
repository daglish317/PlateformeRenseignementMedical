"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

import PublicLayout from "@/components/layout/PublicLayout";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { StructureSetupForm } from "@/features/gestionnaire/components/StructureSetupForm";
import { useMyStructure } from "@/features/shared/structure-profile/hooks/useMyStructure";

const TYPE_TO_ROUTE: Record<string, string> = {
  HOPITAL: "hospital",
  PHARMACIE: "pharmacy",
};

export default function GestionnaireSetupPage() {
  const router = useRouter();
  const authenticated = useAuthStore((state) => state.authenticated);
  const hydrated = useAuthStore((state) => state.hydrated);
  const { data: structure } = useMyStructure(hydrated && authenticated);

  useEffect(() => {
    if (!hydrated) return;

    if (!authenticated) {
      router.replace("/connexion");
      return;
    }

    if (!structure) return;

    const statut = structure.statut;
    const route = TYPE_TO_ROUTE[structure.type.toUpperCase()] || "hospital";

    if (statut === "ACTIVE") {
      router.replace(`/${route}`);
    }
  }, [authenticated, hydrated, router, structure]);

  if (!hydrated || !authenticated) return null;

  return (
    <PublicLayout showSearch={false} showFooter={true}>
      <AuthLayout>
        <AuthCard title="Configuration de votre structure">
          <StructureSetupForm />
        </AuthCard>
      </AuthLayout>
    </PublicLayout>
  );
}
