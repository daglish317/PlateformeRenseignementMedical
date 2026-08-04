import { useMemo } from "react";
import { usePathname } from "@/i18n/navigation";
import { useNotifications } from "@/providers/notification.provider";
import {
  hospitalNavigation,
} from "../navigation/hospital-navigation";
import {
  pharmacyNavigation,
} from "../navigation/pharmacy-navigation";

type DashboardType = "HOPITAL" | "PHARMACIE";

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/hospital" || href === "/pharmacy") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(href + "/");
}

export function useDashboardNavigation(type: DashboardType) {
  const pathname = usePathname();
  const { unreadByNavItem } = useNotifications();

  const baseNavigation =
    type === "HOPITAL" ? hospitalNavigation : pharmacyNavigation;

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
