import {
  Banknote,
  BarChart3,
  Bell,
  Building2,
  ClipboardList,
  History,
  LayoutDashboard,
} from "lucide-react";
import type { DashboardNavItem } from "../types";

export const ownerNavigation: DashboardNavItem[] = [
  {
    label: "Dashboard",
    href: "/owner",
    icon: LayoutDashboard,
    permission: "PROPRIETAIRE",
  },
  {
    label: "Structures & Équipe",
    href: "/owner/team",
    icon: Building2,
    permission: "PROPRIETAIRE",
  },
  {
    label: "Inventaires",
    href: "/owner/inventaires",
    icon: ClipboardList,
    permission: "PROPRIETAIRE",
  },
  {
    label: "Historique",
    href: "/owner/history",
    icon: History,
    permission: "PROPRIETAIRE",
  },
  {
    label: "Statistiques",
    href: "/owner/statistics",
    icon: BarChart3,
    permission: "PROPRIETAIRE",
  },
  {
    label: "Alertes",
    href: "/owner/alertes",
    icon: Bell,
    permission: "PROPRIETAIRE",
  },
  {
    label: "Caisse",
    href: "/owner/caisse",
    icon: Banknote,
    permission: "PROPRIETAIRE",
  },
];
