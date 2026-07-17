"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { getRedirectPath } from "@/features/auth/utils/redirect";

interface GuestRouteProps {
  children: React.ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const router = useRouter();
  const authenticated = useAuthStore((state) => state.authenticated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (authenticated && user) {
      const path = getRedirectPath(user);
      router.push(path);
    }
  }, [authenticated, user, router]);

  if (authenticated && user) {
    return null;
  }

  return <>{children}</>;
}
