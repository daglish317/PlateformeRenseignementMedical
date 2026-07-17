"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth-store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  redirectTo = "/connexion",
}: ProtectedRouteProps) {
  const router = useRouter();
  const authenticated = useAuthStore((state) => state.authenticated);

  useEffect(() => {
    if (!authenticated) {
      router.push(redirectTo);
    }
  }, [authenticated, router, redirectTo]);

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}
