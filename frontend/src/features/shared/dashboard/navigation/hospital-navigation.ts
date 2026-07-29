import {
  LayoutDashboard,
  Building2,
  FlaskConical,
  Monitor,
  HeartPulse,
  Clock,
  MessagesSquare,
  Bell,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type HospitalNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: "GESTIONNAIRE";
  navItem?: string;
};

export const hospitalNavigation: HospitalNavItem[] = [
  {
    label: "Dashboard",
    href: "/hospital",
    icon: LayoutDashboard,
    permission: "GESTIONNAIRE",
  },
  {
    label: "Profil",
    href: "/hospital/profile",
    icon: Building2,
    permission: "GESTIONNAIRE",
    navItem: "profil",
  },
  {
    label: "Analyses",
    href: "/hospital/analyses",
    icon: FlaskConical,
    permission: "GESTIONNAIRE",
    navItem: "analyses",
  },
  {
    label: "Plateaux techniques",
    href: "/hospital/technical-platforms",
    icon: Monitor,
    permission: "GESTIONNAIRE",
    navItem: "plateaux-techniques",
  },
  {
    label: "Prises en charge",
    href: "/hospital/care-services",
    icon: HeartPulse,
    permission: "GESTIONNAIRE",
    navItem: "prises-en-charge",
  },
  {
    label: "Horaires",
    href: "/hospital/schedules",
    icon: Clock,
    permission: "GESTIONNAIRE",
    navItem: "horaires",
  },
  {
    label: "Messages",
    href: "/hospital/chat",
    icon: MessagesSquare,
    permission: "GESTIONNAIRE",
    navItem: "messages",
  },
  {
    label: "Notifications",
    href: "/hospital/notifications",
    icon: Bell,
    permission: "GESTIONNAIRE",
    navItem: "notifications",
  },
  {
    label: "Statistiques",
    href: "/hospital/statistics",
    icon: BarChart3,
    permission: "GESTIONNAIRE",
  },
  {
    label: "Paramètres",
    href: "/hospital/settings",
    icon: Settings,
    permission: "GESTIONNAIRE",
  },
];
