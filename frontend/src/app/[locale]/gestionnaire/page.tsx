"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

import { useAuthStore } from "@/features/auth/store/auth-store";
import { useMyStructure } from "@/features/shared/structure-profile/hooks/useMyStructure";

const TYPE_TO_ROUTE: Record<string, string> = {
  HOPITAL: "hospital",
  PHARMACIE: "pharmacy",
};

export default function GestionnaireRootPage() {
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

    const statut = structure.statut;
    const route = TYPE_TO_ROUTE[structure.type.toUpperCase()] || "hospital";

    if (statut === "ACTIVE") {
      router.replace(`/${route}`);
    } else {
      router.replace("/gestionnaire/setup");
    }
  }, [authenticated, hydrated, isError, router, structure]);

  return null;
}
