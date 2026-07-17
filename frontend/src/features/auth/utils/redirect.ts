import { User } from "@/features/auth/types/user";

export const getRedirectPath = (user: User): string => {
  if (user.role === "ADMINISTRATEUR") {
    return "/admin";
  }

  if (user.role === "GESTIONNAIRE") {
    // For now, since we don't have structure type, redirect to home
    // TODO: Add structure type check when available
    return "/";
  }

  return "/";
};
