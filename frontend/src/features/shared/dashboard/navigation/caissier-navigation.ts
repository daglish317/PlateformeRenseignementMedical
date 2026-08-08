import { Building2, LayoutDashboard, Settings } from "lucide-react";
import type { DashboardNavItem } from "../types";

export const caissierNavigation: DashboardNavItem[] = [
  {
    label: "Dashboard",
    href: "/caissier",
    icon: LayoutDashboard,
    permission: "CAISSIER",
  },
  {
    label: "Profil",
    href: "/caissier/profile",
    icon: Building2,
    permission: "CAISSIER",
    navItem: "profil",
  },
  {
    label: "Paramètres",
    href: "/caissier/settings",
    icon: Settings,
    permission: "CAISSIER",
  },
];
