import type { LucideIcon } from "lucide-react";

export type DashboardType = "HOPITAL" | "PHARMACIE" | "OWNER" | "CAISSIER";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: string;
  navItem?: string;
};
