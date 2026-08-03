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
  const [structureStatus, setStructureStatus] = useState<
    "pending" | "ok" | "no"
  >("pending");

  useEffect(() => {
    if (!hydrated) return;

    if (!authenticated) {
      router.push("/connexion");
      return;
    }

    if (user && !hasGestionnairePermission(user.role)) {
      router.push("/");
      return;
    }

    api
      .get("/structures/me/")
      .then(({ data }) => {
        const structureType = (data.type as string).toUpperCase();

        if (structureType === type && data.statut === "ACTIVE") {
          setStructureStatus("ok");
        } else {
          const route = TYPE_TO_ROUTE[structureType] || "hospital";
          router.replace(`/${route}`);
          setStructureStatus("no");
        }
      })
      .catch(() => {
        router.replace("/gestionnaire/setup");
        setStructureStatus("no");
      });
  }, [authenticated, hydrated, user, router, type]);

  const blocked = !authenticated || !user || !hasGestionnairePermission(user.role);

  if (!hydrated || structureStatus === "pending") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (blocked || structureStatus !== "ok") {
    return null;
  }

  return <>{children}</>;
}
