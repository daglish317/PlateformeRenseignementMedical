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
  },
  {
    label: "Stock",
    href: "/pharmacy/stock",
    icon: Package,
    permission: "GESTIONNAIRE",
  },
  {
    label: "Horaires",
    href: "/pharmacy/schedules",
    icon: Clock,
    permission: "GESTIONNAIRE",
  },
  {
    label: "Messages",
    href: "/pharmacy/chat",
    icon: MessagesSquare,
    permission: "GESTIONNAIRE",
  },
  {
    label: "Notifications",
    href: "/pharmacy/notifications",
    icon: Bell,
    permission: "GESTIONNAIRE",
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
