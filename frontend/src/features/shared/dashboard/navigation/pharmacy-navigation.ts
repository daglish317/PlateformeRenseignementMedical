import {
  LayoutDashboard,
  Building2,
  Package,
  Truck,
  Clock,
  MessagesSquare,
  Bell,
  Settings,
  ShoppingCart,
  ClipboardList,
  History,
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
    label: "Vente",
    href: "/pharmacy/sale",
    icon: ShoppingCart,
    permission: "GESTIONNAIRE",
    navItem: "vente",
  },
  {
    label: "Approvisionnement",
    href: "/pharmacy/supply",
    icon: Truck,
    permission: "GESTIONNAIRE",
    navItem: "stock",
  },
  {
    label: "Inventaire",
    href: "/pharmacy/inventory",
    icon: ClipboardList,
    permission: "GESTIONNAIRE",
  },
  {
    label: "Historique",
    href: "/pharmacy/history",
    icon: History,
    permission: "GESTIONNAIRE",
  },
  {
    label: "Alertes",
    href: "/pharmacy/alertes",
    icon: Bell,
    permission: "GESTIONNAIRE",
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
    label: "Paramètres",
    href: "/pharmacy/settings",
    icon: Settings,
    permission: "GESTIONNAIRE",
  },
];
