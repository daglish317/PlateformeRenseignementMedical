import { usePathname } from "@/i18n/navigation";
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

  const navigation =
    type === "HOPITAL" ? hospitalNavigation : pharmacyNavigation;

  const activeItem = navigation.find((item) =>
    isActiveRoute(pathname, item.href)
  );

  return {
    navigation,
    activeItem,
    pathname,
  };
}
