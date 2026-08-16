import { User } from "@/features/auth/types/user";

type RedirectPath = "/" | "/admin" | "/owner" | "/pharmacy" | "/hospital";

export const getRedirectPath = (user: User): RedirectPath => {

  switch (user.role) {

    case "ADMINISTRATEUR":
      return "/admin";

    case "PROPRIETAIRE":
      return "/owner";

    case "GESTIONNAIRE":
    case "CAISSIER":
      // GESTIONNAIRE et CAISSIER utilisent le même dashboard équipe pharmacie
      return "/pharmacy";

    case "PATIENT":
      return "/";

    default:
      return "/";
  }

};
