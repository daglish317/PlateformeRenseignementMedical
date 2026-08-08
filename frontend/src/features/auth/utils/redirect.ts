import { User } from "@/features/auth/types/user";

type RedirectPath = "/" | "/admin" | "/owner" | "/pharmacy" | "/caissier";

export const getRedirectPath = (user: User): RedirectPath => {

  switch (user.role) {

    case "ADMINISTRATEUR":
      return "/admin";

    case "PROPRIETAIRE":
      return "/owner";

    case "GESTIONNAIRE":
      return "/pharmacy";

    case "CAISSIER":
      return "/caissier";

    case "PATIENT":
      return "/";

    default:
      return "/";
  }

};
