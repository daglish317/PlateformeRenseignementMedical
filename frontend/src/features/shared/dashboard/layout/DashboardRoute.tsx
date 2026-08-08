"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

import { useAuthStore } from "@/features/auth/store/auth-store";
import { getRedirectPath } from "@/features/auth/utils/redirect";
import type { RoleUtilisateur } from "@/features/auth/types/user";
import { useMyStructure } from "@/features/shared/structure-profile/hooks/useMyStructure";
import type { DashboardType } from "../types";

const TYPE_TO_ROUTE: Record<string, string> = {
  HOPITAL: "hospital",
  PHARMACIE: "pharmacy",
};

const STRUCTURE_TYPES: DashboardType[] = ["HOPITAL", "PHARMACIE"];

function isAllowedRole(role: RoleUtilisateur, type: DashboardType): boolean {
  switch (type) {
    case "HOPITAL":
      return role === "PROPRIETAIRE" || role === "GESTIONNAIRE";
    case "PHARMACIE":
      return role === "GESTIONNAIRE";
    case "OWNER":
      return role === "PROPRIETAIRE";
    case "CAISSIER":
      return role === "CAISSIER";
  }
}

interface DashboardRouteProps {
  children: React.ReactNode;
  type: DashboardType;
}

export function DashboardRoute({ children, type }: DashboardRouteProps) {
  const authenticated = useAuthStore((state) => state.authenticated);
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const requiresStructure = STRUCTURE_TYPES.includes(type);
  const canCheckStructure =
    hydrated &&
    authenticated &&
    Boolean(user) &&
    requiresStructure;

  const { data: structure, isLoading, isError } = useMyStructure(canCheckStructure);

  useEffect(() => {
    if (!hydrated) return;

    if (!authenticated) {
      router.replace("/connexion");
      return;
    }

    if (user && !isAllowedRole(user.role, type)) {
      router.replace(getRedirectPath(user));
      return;
    }

    if (!requiresStructure) return;

    if (isError) {
      router.replace("/gestionnaire/setup");
      return;
    }

    if (!structure) return;

    const structureType = structure.type.toUpperCase();

    if (structureType !== type) {
      const route = TYPE_TO_ROUTE[structureType] || "hospital";
      router.replace(`/${route}`);
    }
  }, [authenticated, hydrated, isError, router, structure, type, user, requiresStructure]);

  const blocked =
    !hydrated ||
    !authenticated ||
    !user ||
    !isAllowedRole(user.role, type) ||
    (requiresStructure &&
      (isLoading ||
        isError ||
        !structure ||
        structure.type.toUpperCase() !== type));

  if (blocked) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
