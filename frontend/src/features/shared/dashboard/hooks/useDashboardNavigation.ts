import { usePathname } from "@/i18n/navigation";
import { useNotifications } from "@/providers/notification.provider";
import {
  hospitalNavigation,
  type HospitalNavItem,
} from "../navigation/hospital-navigation";
import {
  pharmacyNavigation,
  type PharmacyNavItem,
} from "../navigation/pharmacy-navigation";

type DashboardType = "HOPITAL" | "PHARMACIE";

type NavItem = HospitalNavItem | PharmacyNavItem;

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/hospital" || href === "/pharmacy") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(href + "/");
}

export function useDashboardNavigation(type: DashboardType) {
  const pathname = usePathname();
  const { getUnreadCount } = useNotifications();

  const baseNavigation =
    type === "HOPITAL" ? hospitalNavigation : pharmacyNavigation;

  const navigation = baseNavigation.map((item) => ({
    ...item,
    badge: item.navItem ? getUnreadCount(item.navItem) : undefined,
  }));

  const activeItem = navigation.find((item) =>
    isActiveRoute(pathname, item.href)
  );

  return {
    navigation,
    activeItem,
    pathname,
  };
}
