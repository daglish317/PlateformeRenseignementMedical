"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/features/auth/store/auth-store";
import api from "@/lib/axios";
import { StructureSetupForm } from "@/features/gestionnaire/components/StructureSetupForm";
import PublicLayout from "@/components/layout/PublicLayout";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthCard } from "@/features/auth/components/AuthCard";

const TYPE_TO_ROUTE: Record<string, string> = {
  HOPITAL: "hospital",
  PHARMACIE: "pharmacy",
};

export default function GestionnaireSetupPage() {
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
        } else if (statut === "EN_ATTENTE") {
          router.replace("/gestionnaire/success");
        }
      })
      .catch(() => {
        // 404 = no structure yet, stay on setup page
      });
  }, [authenticated, router]);

  if (!authenticated) return null;

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
