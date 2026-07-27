"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/features/auth/store/auth-store";
import api from "@/lib/axios";
import { SuccessPage } from "@/features/gestionnaire/components/SuccessPage";
import PublicLayout from "@/components/layout/PublicLayout";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthCard } from "@/features/auth/components/AuthCard";

const TYPE_TO_ROUTE: Record<string, string> = {
  HOPITAL: "hospital",
  PHARMACIE: "pharmacy",
};

export default function GestionnaireSuccessPage() {
  const router = useRouter();
  const authenticated = useAuthStore((s) => s.authenticated);

  useEffect(() => {
    if (!authenticated) {
      router.replace("/connexion");
      return;
    }

    api
      .get("/structures/me/")
      .then(({ data }) => {
        const statut = data.statut as string;
        const route = TYPE_TO_ROUTE[(data.type as string).toUpperCase()] || "hospital";

        if (statut === "ACTIVE") {
          router.replace(`/${route}`);
        }
      })
      .catch(() => {
        router.replace("/gestionnaire/setup");
      });
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
