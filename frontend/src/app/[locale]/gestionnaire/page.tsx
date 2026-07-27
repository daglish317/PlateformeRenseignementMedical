"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/features/auth/store/auth-store";
import api from "@/lib/axios";

const TYPE_TO_ROUTE: Record<string, string> = {
  HOPITAL: "hospital",
  PHARMACIE: "pharmacy",
};

export default function GestionnaireRootPage() {
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
        } else {
          router.replace("/gestionnaire/setup");
        }
      })
      .catch(() => {
        router.replace("/gestionnaire/setup");
      });
  }, [authenticated, router]);

  return null;
}
