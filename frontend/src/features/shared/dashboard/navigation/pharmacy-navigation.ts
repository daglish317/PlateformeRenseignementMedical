import {
  LayoutDashboard,
  Building2,
  Package,
  Clock,
  MessagesSquare,
  Bell,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type PharmacyNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: "GESTIONNAIRE";
  navItem?: string;
};

export const pharmacyNavigation: PharmacyNavItem[] = [
  {
    label: "Dashboard",
    href: "/pharmacy",
    icon: LayoutDashboard,
    permission: "GESTIONNAIRE",
  },
  {
    label: "Profil",
    href: "/pharmacy/profile",
    icon: Building2,
    permission: "GESTIONNAIRE",
    navItem: "profil",
  },
  {
    label: "Stock",
    href: "/pharmacy/stock",
    icon: Package,
    permission: "GESTIONNAIRE",
    navItem: "stock",
  },
  {
    label: "Horaires",
    href: "/pharmacy/schedules",
    icon: Clock,
    permission: "GESTIONNAIRE",
    navItem: "horaires",
  },
  {
    label: "Messages",
    href: "/pharmacy/chat",
    icon: MessagesSquare,
    permission: "GESTIONNAIRE",
    navItem: "messages",
  },
  {
    label: "Notifications",
    href: "/pharmacy/notifications",
    icon: Bell,
    permission: "GESTIONNAIRE",
    navItem: "notifications",
  },
  {
    label: "Statistiques",
    href: "/pharmacy/statistics",
    icon: BarChart3,
    permission: "GESTIONNAIRE",
  },
  {
    label: "Paramètres",
    href: "/pharmacy/settings",
    icon: Settings,
    permission: "GESTIONNAIRE",
  },
];
