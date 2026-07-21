export type { AdminNavItem } from "../navigation/navigation";

export type BreadcrumbItem = {
  label: string;
  href: "/admin" | "/admin/structures" | "/admin/managers" | "/admin/users" | "/admin/catalog" | "/admin/map" | "/admin/statistics" | "/admin/feedback" | "/admin/chat" | "/admin/notifications" | "/admin/settings";
};
