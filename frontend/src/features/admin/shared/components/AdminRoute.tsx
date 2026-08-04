"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

import { useAuthStore } from "@/features/auth/store/auth-store";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { hasAdminPermission } from "../navigation/permissions";
import { AdminLoading } from "./AdminLoading";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const router = useRouter();
  const authenticated = useAuthStore((state) => state.authenticated);
  const hydrated = useAuthStore((state) => state.hydrated);
  const storedUser = useAuthStore((state) => state.user);
  const { data: currentUser, isLoading, isError } = useCurrentUser();
  const user = storedUser ?? currentUser;

  useEffect(() => {
    if (!hydrated) return;

    if (!authenticated || isError) {
      router.replace("/connexion");
      return;
    }

    if (user && !hasAdminPermission(user.role)) {
      router.replace("/");
    }
  }, [authenticated, hydrated, isError, router, user]);

  if (!hydrated || isLoading) {
    return <AdminLoading label="Verification des acces..." />;
  }

  if (!authenticated || !user || !hasAdminPermission(user.role)) {
    return null;
  }

  return <>{children}</>;
}
