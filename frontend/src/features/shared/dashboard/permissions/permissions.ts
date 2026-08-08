import type { RoleUtilisateur } from "@/features/auth/types/user";

export function hasGestionnairePermission(role: RoleUtilisateur): boolean {
  return role === "PROPRIETAIRE" || role === "GESTIONNAIRE";
}
