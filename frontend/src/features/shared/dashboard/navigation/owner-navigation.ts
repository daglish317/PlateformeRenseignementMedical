import {
  Banknote,
  BarChart3,
  Bell,
  Building2,
  ClipboardList,
  History,
  LayoutDashboard,
  Settings,
  MessagesSquare,
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
    label: "Profil",
    href: "/owner/profile",
    icon: Building2,
    permission: "PROPRIETAIRE",
    navItem: "profil",
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
    label: "Messagerie",
    href: "/owner/chat",
    icon: MessagesSquare,
    permission: "PROPRIETAIRE",
  },
  {
    label: "Caisse",
    href: "/owner/caisse",
    icon: Banknote,
    permission: "PROPRIETAIRE",
  },
  {
    label: "Paramètres",
    href: "/owner/settings",
    icon: Settings,
    permission: "PROPRIETAIRE",
  },
];
