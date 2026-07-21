import { User } from "@/features/auth/types/user";

type RedirectPath = "/" | "/admin" | "/gestionnaire";

export const getRedirectPath = (user: User): RedirectPath => {

  switch (user.role) {

    case "ADMINISTRATEUR":
      return "/admin";

    case "GESTIONNAIRE":
      return "/gestionnaire";

    case "PATIENT":
      return "/";

    default:
      return "/";
  }

};