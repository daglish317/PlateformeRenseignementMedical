import { useMemo } from "react";
import { usePathname } from "@/i18n/navigation";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useNotifications } from "@/providers/notification.provider";
import {
  hospitalNavigation,
} from "../navigation/hospital-navigation";
import {
  pharmacyNavigation,
} from "../navigation/pharmacy-navigation";
import { ownerNavigation } from "../navigation/owner-navigation";
import type { DashboardNavItem, DashboardType } from "../types";
import { useMyStructureId } from "./useMyStructureId";
import { useMyPermissions } from "./useMyPermissions";
import { useMyStructure } from "@/features/shared/structure-profile/hooks/useMyStructure";
import { filterDashboardNavigation } from "../utils/permissions";

const NAVIGATION: Record<DashboardType, DashboardNavItem[]> = {
  HOPITAL: hospitalNavigation,
  PHARMACIE: pharmacyNavigation,
  OWNER: ownerNavigation,
};

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/hospital" || href === "/pharmacy" || href === "/owner") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(href + "/");
}

export function useDashboardNavigation(type: DashboardType) {
  const pathname = usePathname();
  const { unreadByNavItem } = useNotifications();
  const user = useAuthStore((state) => state.user);
  const { data: structureId } = useMyStructureId(type !== "OWNER");

  // Pour le propriétaire, récupérer le type de structure pour filtrer
  const { data: myStructure } = useMyStructure(type === "OWNER");
  const structureType = myStructure?.type;
  const ownerStructureId = myStructure?.id;
  const activeStructureId = type === "OWNER" ? ownerStructureId : structureId;

  const { data: permissions } = useMyPermissions(
    activeStructureId,
    Boolean(activeStructureId)
  );

  const baseNavigation = NAVIGATION[type];

  const navigation = useMemo(
    () => {
      // Filtrer d'abord selon le type de structure pour le propriétaire
      let filteredByType = baseNavigation;
      if (type === "OWNER" && structureType) {
        filteredByType = baseNavigation.filter(
          (item) => !item.structureType || item.structureType === structureType
        );
      }

      // Ensuite filtrer selon les permissions
      return filterDashboardNavigation(
        filteredByType,
        user?.role,
        permissions?.modules
      ).map((item) => ({
        ...item,
        badge: item.navItem ? unreadByNavItem[item.navItem] ?? 0 : undefined,
      }));
    },
    [baseNavigation, structureType, permissions?.modules, unreadByNavItem, user?.role, type]
  );

  const activeItem = useMemo(
    () => navigation.find((item) => isActiveRoute(pathname, item.href)),
    [navigation, pathname]
  );

  return {
    navigation,
    activeItem,
    pathname,
  };
}
