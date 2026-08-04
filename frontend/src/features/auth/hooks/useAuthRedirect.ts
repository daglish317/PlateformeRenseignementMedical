"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";

import { useAuthStore } from "@/features/auth/store/auth-store";
import { getRedirectPath } from "@/features/auth/utils/redirect";

export const useAuthRedirect = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectAfterAuth = () => {
    const returnTo = searchParams.get("returnTo");

    if (returnTo) {
      router.push(returnTo);
      return;
    }

    const user = useAuthStore.getState().user;

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
