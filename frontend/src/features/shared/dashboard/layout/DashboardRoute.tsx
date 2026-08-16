"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";

import { useAuthStore } from "@/features/auth/store/auth-store";
import { getRedirectPath } from "@/features/auth/utils/redirect";
import { useMyStructure } from "@/features/shared/structure-profile/hooks/useMyStructure";
import type { DashboardType } from "../types";
import { useMyPermissions } from "../hooks/useMyPermissions";
import { getDashboardRouteRequirement } from "../constants/route-permissions";
import { hasModuleAction } from "../utils/permissions";
import type { RoleUtilisateur } from "@/features/auth/types/user";

const TYPE_TO_ROUTE: Record<string, string> = {
  HOPITAL: "hospital",
  PHARMACIE: "pharmacy",
};

const TYPE_TO_STRUCTURE_TYPE: Partial<Record<DashboardType, string>> = {
  HOPITAL: "HOPITAL",
  PHARMACIE: "PHARMACIE",
};

function isAllowedRole(role: RoleUtilisateur, type: DashboardType): boolean {
  switch (type) {
    case "HOPITAL":
      return role === "PROPRIETAIRE" || role === "GESTIONNAIRE";
    case "PHARMACIE":
      return role === "GESTIONNAIRE" || role === "CAISSIER";
    case "OWNER":
      return role === "PROPRIETAIRE";
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
  const pathname = usePathname();

  const requiresStructure = type !== "OWNER";
  const canCheckStructure =
    hydrated &&
    authenticated &&
    Boolean(user) &&
    requiresStructure;

  const {
    data: structure,
    isLoading: structureLoading,
  } = useMyStructure(canCheckStructure);
  const {
    data: permissions,
    isLoading: permissionsLoading,
  } = useMyPermissions(structure?.id, canCheckStructure && Boolean(structure?.id));
  const routeRequirement = getDashboardRouteRequirement(type, pathname);
  const structureType = structure?.type?.toUpperCase();
  const expectedStructureType = TYPE_TO_STRUCTURE_TYPE[type];
  const hasRoutePermission =
    !routeRequirement?.blocked &&
    (!routeRequirement?.module ||
      hasModuleAction(
        permissions?.modules,
        routeRequirement.module,
        routeRequirement.action ?? "CONSULTER"
      ));

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

    if (structureLoading || permissionsLoading) {
      return;
    }

    if (routeRequirement?.blocked) {
      router.replace(`/${type.toLowerCase()}`);
      return;
    }

    if (!structure) {
      return;
    }

    if (routeRequirement && !hasRoutePermission) {
      router.replace(`/${type.toLowerCase()}`);
      return;
    }

    if (structureType && expectedStructureType && structureType !== expectedStructureType) {
      const route = TYPE_TO_ROUTE[structureType] || "hospital";
      router.replace(`/${route}`);
    }
  }, [
    authenticated,
    hydrated,
    hasRoutePermission,
    pathname,
    permissionsLoading,
    requiresStructure,
    routeRequirement,
    router,
    structure,
    structureLoading,
    structureType,
    expectedStructureType,
    type,
    user,
  ]);

  const blocked =
    !hydrated ||
    !authenticated ||
    !user ||
    !isAllowedRole(user.role, type) ||
    (requiresStructure &&
      (structureLoading ||
        permissionsLoading ||
        (structureType && expectedStructureType
          ? structureType !== expectedStructureType
          : false) ||
        Boolean(routeRequirement?.blocked) ||
        (routeRequirement && !hasRoutePermission)));

  if (blocked) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
