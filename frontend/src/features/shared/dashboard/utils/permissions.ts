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
  if (item.permission && role && item.permission !== role) {
    return false;
  }

  if (!item.module) {
    return true;
  }

  return hasModuleAction(permissions, item.module, (item.action as ActionPermission) ?? "CONSULTER");
}

export function filterDashboardNavigation(
  items: DashboardNavItem[],
  role?: string | null,
  permissions?: ModulePermissionsMap
): DashboardNavItem[] {
  return items.filter((item) => canAccessDashboardNavItem(item, role, permissions));
}
