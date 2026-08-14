import type { LucideIcon } from "lucide-react";
import type { ActionPermission, ModuleOperationnel } from "./types/permissions";

export type DashboardType = "HOPITAL" | "PHARMACIE" | "OWNER" | "CAISSIER";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: "ADMINISTRATEUR" | "PROPRIETAIRE" | "GESTIONNAIRE" | "CAISSIER";
  module?: ModuleOperationnel;
  action?: ActionPermission;
  navItem?: string;
  badge?: number;
};
