"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

import { useAuthStore } from "@/features/auth/store/auth-store";
import { getRedirectPath } from "@/features/auth/utils/redirect";

export default function GestionnaireRootPage() {
  const router = useRouter();
  const authenticated = useAuthStore((state) => state.authenticated);
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!hydrated) return;

    if (!authenticated) {
      router.replace("/connexion");
      return;
    }

    if (!user) {
      return;
    }

    router.replace(getRedirectPath(user));
  }, [authenticated, hydrated, router, user]);

  return null;
}
