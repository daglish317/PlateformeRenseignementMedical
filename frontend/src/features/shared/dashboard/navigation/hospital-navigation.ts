import {
  LayoutDashboard,
  Building2,
  Stethoscope,
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
  },
  {
    label: "Services",
    href: "/hospital/services",
    icon: Stethoscope,
    permission: "GESTIONNAIRE",
  },
  {
    label: "Analyses",
    href: "/hospital/analyses",
    icon: FlaskConical,
    permission: "GESTIONNAIRE",
  },
  {
    label: "Plateaux techniques",
    href: "/hospital/technical-platforms",
    icon: Monitor,
    permission: "GESTIONNAIRE",
  },
  {
    label: "Prises en charge",
    href: "/hospital/care-services",
    icon: HeartPulse,
    permission: "GESTIONNAIRE",
  },
  {
    label: "Horaires",
    href: "/hospital/schedules",
    icon: Clock,
    permission: "GESTIONNAIRE",
  },
  {
    label: "Messages",
    href: "/hospital/chat",
    icon: MessagesSquare,
    permission: "GESTIONNAIRE",
  },
  {
    label: "Notifications",
    href: "/hospital/notifications",
    icon: Bell,
    permission: "GESTIONNAIRE",
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
