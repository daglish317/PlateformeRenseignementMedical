import type { LucideIcon } from "lucide-react";

export type StructureType = "HOPITAL" | "PHARMACIE";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: "GESTIONNAIRE";
  badge?: number;
};

export type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

export type SidebarSection = {
  title?: string;
  items: NavigationItem[];
};
