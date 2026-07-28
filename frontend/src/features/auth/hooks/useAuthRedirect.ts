"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";

import { useAuthStore } from "@/features/auth/store/auth-store";
import { getRedirectPath } from "@/features/auth/utils/redirect";

export const useAuthRedirect = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const user = useAuthStore(
    (state) => state.user
  );

  const redirectAfterAuth = () => {
    const returnTo = searchParams.get("returnTo");

    if (returnTo) {
      router.push(returnTo);
      return;
    }

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
