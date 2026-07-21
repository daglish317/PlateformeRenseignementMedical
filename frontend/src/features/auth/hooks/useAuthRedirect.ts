"use client";

import { useRouter } from "@/i18n/navigation";

import { useAuthStore } from "@/features/auth/store/auth-store";
import { getRedirectPath } from "@/features/auth/utils/redirect";

export const useAuthRedirect = () => {
  const router = useRouter();

  const user = useAuthStore(
    (state) => state.user
  );

  const redirectAfterAuth = () => {
    if (!user) {
      return;
    }

    const path = getRedirectPath(user);

    router.push(path);
  };

  return {
    redirectAfterAuth,
  };
};