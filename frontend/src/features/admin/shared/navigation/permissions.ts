import { RoleUtilisateur } from "@/features/auth/types/user";

export type AdminPermission = "ADMIN";

export const ADMIN_ROLE: RoleUtilisateur = "ADMINISTRATEUR";

export function hasAdminPermission(role?: RoleUtilisateur | null): boolean {
  return role === ADMIN_ROLE;
}

export function canAccessAdminRoute(role?: RoleUtilisateur | null): boolean {
  return hasAdminPermission(role);
}
