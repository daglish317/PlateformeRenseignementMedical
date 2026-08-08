import { useMemo } from "react";
import { usePathname } from "@/i18n/navigation";
import { useNotifications } from "@/providers/notification.provider";
import {
  hospitalNavigation,
} from "../navigation/hospital-navigation";
import {
  pharmacyNavigation,
} from "../navigation/pharmacy-navigation";
import { ownerNavigation } from "../navigation/owner-navigation";
import { caissierNavigation } from "../navigation/caissier-navigation";
import type { DashboardNavItem, DashboardType } from "../types";

const NAVIGATION: Record<DashboardType, DashboardNavItem[]> = {
  HOPITAL: hospitalNavigation,
  PHARMACIE: pharmacyNavigation,
  OWNER: ownerNavigation,
  CAISSIER: caissierNavigation,
};

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/hospital" || href === "/pharmacy" || href === "/owner" || href === "/caissier") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(href + "/");
}

export function useDashboardNavigation(type: DashboardType) {
  const pathname = usePathname();
  const { unreadByNavItem } = useNotifications();

  const baseNavigation = NAVIGATION[type];

  const navigation = useMemo(
    () =>
      baseNavigation.map((item) => ({
        ...item,
        badge: item.navItem ? unreadByNavItem[item.navItem] ?? 0 : undefined,
      })),
    [baseNavigation, unreadByNavItem]
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
