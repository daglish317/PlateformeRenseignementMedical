import {
  LayoutDashboard,
  Building2,
  UserCog,
  Users,
  Map,
  BarChart3,
  MessageSquare,
  MessagesSquare,
  Bell,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: "/admin" | "/admin/structures" | "/admin/managers" | "/admin/users" | "/admin/catalog" | "/admin/services" | "/admin/map" | "/admin/statistics" | "/admin/feedback" | "/admin/chat" | "/admin/notifications" | "/admin/settings";
  icon: LucideIcon;
  permission: "ADMIN";
  navItem?: string;
};

export const adminNavigation: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, permission: "ADMIN" },
  { label: "Structures", href: "/admin/structures", icon: Building2, permission: "ADMIN", navItem: "structures" },
  { label: "Gestionnaires", href: "/admin/managers", icon: UserCog, permission: "ADMIN", navItem: "managers" },
  { label: "Utilisateurs", href: "/admin/users", icon: Users, permission: "ADMIN", navItem: "users" },
  { label: "Carte", href: "/admin/map", icon: Map, permission: "ADMIN" },
  { label: "Statistiques", href: "/admin/statistics", icon: BarChart3, permission: "ADMIN" },
  { label: "Feedback", href: "/admin/feedback", icon: MessageSquare, permission: "ADMIN", navItem: "feedback" },
  { label: "Messagerie", href: "/admin/chat", icon: MessagesSquare, permission: "ADMIN", navItem: "messages" },
  { label: "Notifications", href: "/admin/notifications", icon: Bell, permission: "ADMIN", navItem: "notifications" },
  { label: "Paramètres", href: "/admin/settings", icon: Settings, permission: "ADMIN" },
];

export const localizedPathnames: Record<string, Record<string, string>> = {
  "/admin": { fr: "/administrateur", en: "/admin" },
  "/admin/structures": { fr: "/administrateur/structures", en: "/admin/structures" },
  "/admin/managers": { fr: "/administrateur/gestionnaires", en: "/admin/managers" },
  "/admin/users": { fr: "/administrateur/utilisateurs", en: "/admin/users" },
  "/admin/catalog": { fr: "/administrateur/catalogue", en: "/admin/catalog" },
  "/admin/map": { fr: "/administrateur/carte", en: "/admin/map" },
  "/admin/statistics": { fr: "/administrateur/statistiques", en: "/admin/statistics" },
  "/admin/feedback": { fr: "/administrateur/retours", en: "/admin/feedback" },
  "/admin/chat": { fr: "/administrateur/messagerie", en: "/admin/chat" },
  "/admin/notifications": { fr: "/administrateur/notifications", en: "/admin/notifications" },
  "/admin/settings": { fr: "/administrateur/parametres", en: "/admin/settings" },
};

export function getLocalizedHref(href: string, _locale: string): string {
  return href;
}

export function isActiveRoute(pathname: string, href: string, _locale: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin" || pathname === "/";
  }
  return pathname === href || pathname.startsWith(href + "/");
}

export const getNavLabel = (href: string): string => {
  const item = adminNavigation.find((n) => n.href === href);
  return item?.label ?? href;
};
