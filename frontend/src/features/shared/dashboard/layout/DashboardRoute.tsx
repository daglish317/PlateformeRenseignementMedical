"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

import { useAuthStore } from "@/features/auth/store/auth-store";
import { hasGestionnairePermission } from "../permissions/permissions";
import { useMyStructure } from "@/features/shared/structure-profile/hooks/useMyStructure";

const TYPE_TO_ROUTE: Record<string, string> = {
  HOPITAL: "hospital",
  PHARMACIE: "pharmacy",
};

interface DashboardRouteProps {
  children: React.ReactNode;
  type: "HOPITAL" | "PHARMACIE";
}

export function DashboardRoute({ children, type }: DashboardRouteProps) {
  const authenticated = useAuthStore((state) => state.authenticated);
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const canCheckStructure =
    hydrated &&
    authenticated &&
    Boolean(user) &&
    user !== null &&
    hasGestionnairePermission(user.role);

  const {
    data: structure,
    isLoading,
    isError,
  } = useMyStructure(canCheckStructure);

  useEffect(() => {
    if (!hydrated) return;

    if (!authenticated) {
      router.replace("/connexion");
      return;
    }

    if (user && !hasGestionnairePermission(user.role)) {
      router.replace("/");
      return;
    }

    if (isError) {
      router.replace("/gestionnaire/setup");
      return;
    }

    if (!structure) return;

    const structureType = structure.type.toUpperCase();

    if (structureType !== type || structure.statut !== "ACTIVE") {
      const route = TYPE_TO_ROUTE[structureType] || "hospital";
      router.replace(`/${route}`);
    }
  }, [authenticated, hydrated, isError, router, structure, type, user]);

  const blocked =
    !hydrated ||
    !authenticated ||
    !user ||
    !hasGestionnairePermission(user.role) ||
    isLoading ||
    isError ||
    !structure ||
    structure.type.toUpperCase() !== type ||
    structure.statut !== "ACTIVE";

  if (blocked) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
