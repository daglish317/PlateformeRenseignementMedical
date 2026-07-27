"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { hasGestionnairePermission } from "../permissions/permissions";
import api from "@/lib/axios";

const TYPE_TO_ROUTE: Record<string, string> = {
  HOPITAL: "hospital",
  PHARMACIE: "pharmacy",
};

interface DashboardRouteProps {
  children: React.ReactNode;
  type: "HOPITAL" | "PHARMACIE";
}

export function DashboardRoute({ children, type }: DashboardRouteProps) {
  const { user, authenticated, hydrated } = useAuthStore();
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!hydrated) return;

    if (!authenticated) {
      router.push("/connexion");
      setAllowed(false);
      return;
    }

    if (user && !hasGestionnairePermission(user.role)) {
      router.push("/");
      setAllowed(false);
      return;
    }

    api
      .get("/structures/me/")
      .then(({ data }) => {
        const structureType = (data.type as string).toUpperCase();
        const backendType = type === "HOPITAL" ? "HOPITAL" : "PHARMACIE";

        if (structureType === backendType && data.statut === "ACTIVE") {
          setAllowed(true);
        } else {
          const route = TYPE_TO_ROUTE[structureType] || "hospital";
          router.replace(`/${route}`);
          setAllowed(false);
        }
      })
      .catch(() => {
        router.replace("/gestionnaire/setup");
        setAllowed(false);
      });
  }, [authenticated, hydrated, user, router, type]);

  if (!hydrated || allowed === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!allowed || !authenticated || !user || !hasGestionnairePermission(user.role)) {
    return null;
  }

  return <>{children}</>;
}
