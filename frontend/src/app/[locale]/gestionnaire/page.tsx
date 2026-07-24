"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/features/auth/store/auth-store";

export default function GestionnaireRootPage() {
  const router = useRouter();
  const authenticated = useAuthStore((s) => s.authenticated);

  useEffect(() => {
    if (!authenticated) {
      router.replace("/connexion");
    } else {
      router.replace("/gestionnaire/setup");
    }
  }, [authenticated, router]);

  return null;
}
