import { LayoutDashboard } from "lucide-react";
import type { DashboardNavItem } from "../types";

export const caissierNavigation: DashboardNavItem[] = [
  {
    label: "Dashboard",
    href: "/caissier",
    icon: LayoutDashboard,
    permission: "CAISSIER",
  },
];
