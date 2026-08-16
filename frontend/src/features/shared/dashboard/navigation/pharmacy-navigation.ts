import {
  LayoutDashboard,
  Building2,
  Package,
  Truck,
  Clock,
  Bell,
  Settings,
  ShoppingCart,
  ClipboardList,
  History,
  CalendarClock,
  Pill,
  Banknote,
  Receipt,
  BarChart3,
} from "lucide-react";
import type { DashboardNavItem } from "../types";

/**
 * Navigation pour le dashboard équipe pharmacie (GESTIONNAIRE + CAISSIER)
 * Les modules visibles dépendent des permissions attribuées par le propriétaire
 * 
 * IMPORTANT:
 * - Profil et Paramètres sont toujours visibles (non conditionnés par permissions)
 * - Messagerie n'est PAS incluse (exclusivement propriétaire)
 * - Tous les autres modules sont filtrés selon les permissions utilisateur
 */
export const pharmacyNavigation: DashboardNavItem[] = [
  {
    label: "Dashboard",
    href: "/pharmacy",
    icon: LayoutDashboard,
  },
  
  // MODULES CONDITIONNELS - Dépendent des permissions
  {
    label: "Stock",
    href: "/pharmacy/stock",
    icon: Package,
    module: "STOCK",
    action: "CONSULTER",
    navItem: "stock",
  },
  {
    label: "Médicaments",
    href: "/pharmacy/medications",
    icon: Pill,
    module: "STOCK",
    action: "CONSULTER",
    navItem: "stock",
  },
  {
    label: "Vente",
    href: "/pharmacy/sale",
    icon: ShoppingCart,
    module: "VENTE",
    action: "CONSULTER",
    navItem: "vente",
  },
  {
    label: "Caisse",
    href: "/pharmacy/caisse",
    icon: Banknote,
    module: "CAISSE",
    action: "CONSULTER",
  },
  {
    label: "Factures",
    href: "/pharmacy/factures",
    icon: Receipt,
    module: "FACTURE",
    action: "CONSULTER",
  },
  {
    label: "Approvisionnement",
    href: "/pharmacy/supply",
    icon: Truck,
    module: "APPROVISIONNEMENT",
    action: "CONSULTER",
    navItem: "stock",
  },
  {
    label: "Inventaire",
    href: "/pharmacy/inventory",
    icon: ClipboardList,
    module: "INVENTAIRE",
    action: "CONSULTER",
  },
  {
    label: "Péremption",
    href: "/pharmacy/peremption",
    icon: CalendarClock,
    module: "PEREMPTION",
    action: "CONSULTER",
    navItem: "stock",
  },
  {
    label: "Historique",
    href: "/pharmacy/history",
    icon: History,
    module: "HISTORIQUE",
    action: "CONSULTER",
  },
  {
    label: "Alertes",
    href: "/pharmacy/alertes",
    icon: Bell,
    module: "ALERTES",
    action: "CONSULTER",
  },
  {
    label: "Horaires",
    href: "/pharmacy/schedules",
    icon: Clock,
    module: "HORAIRES",
    action: "CONSULTER",
    navItem: "horaires",
  },
  {
    label: "Statistiques",
    href: "/pharmacy/statistics",
    icon: BarChart3,
    module: "STATISTIQUES",
    action: "CONSULTER",
  },
  {
    label: "Notifications",
    href: "/pharmacy/notifications",
    icon: Bell,
    module: "NOTIFICATIONS",
    action: "CONSULTER",
    navItem: "notifications",
  },
  
  // MODULES OBLIGATOIRES - Toujours visibles (pas de module/action)
  {
    label: "Profil",
    href: "/pharmacy/profile",
    icon: Building2,
    navItem: "profil",
  },
  {
    label: "Paramètres",
    href: "/pharmacy/settings",
    icon: Settings,
  },
];
