import type { DashboardNavItem } from "../types";
import type { ActionPermission, ModulePermissionsMap } from "../types/permissions";

export function hasModuleAction(
  permissions: ModulePermissionsMap | undefined,
  module: string,
  action: ActionPermission = "CONSULTER"
): boolean {
  if (!permissions) {
    return false;
  }

  const allowedActions = permissions[module as keyof ModulePermissionsMap] ?? [];
  return allowedActions.includes(action);
}

export function canAccessDashboardNavItem(
  item: DashboardNavItem,
  role?: string | null,
  permissions?: ModulePermissionsMap
): boolean {
  // Vérifier d'abord la permission de rôle (pour owner par exemple)
  if (item.permission && role && item.permission !== role) {
    return false;
  }

  // Si pas de module défini, c'est un élément toujours visible
  // (Dashboard, Profil, Paramètres pour les membres d'équipe)
  if (!item.module) {
    return true;
  }

  // Pour les items avec module, vérifier les permissions
  return hasModuleAction(permissions, item.module, (item.action as ActionPermission) ?? "CONSULTER");
}

export function filterDashboardNavigation(
  items: DashboardNavItem[],
  role?: string | null,
  permissions?: ModulePermissionsMap
): DashboardNavItem[] {
  return items.filter((item) => canAccessDashboardNavItem(item, role, permissions));
}
