import type { User } from "@/features/auth/types/user";

type RedirectPath = "/" | "/admin" | "/owner" | "/pharmacy" | "/hospital";

export const getRedirectPath = (user: User): RedirectPath => {
  switch (user.role) {
    case "ADMINISTRATEUR":
      return "/admin";

    case "PROPRIETAIRE":
      return "/owner";

    case "GESTIONNAIRE":
      return user.active_structure?.type === "HOPITAL" ? "/hospital" : "/pharmacy";

    case "CAISSIER":
      return "/pharmacy";

    case "PATIENT":
      return "/";

    default:
      return "/";
  }
};
