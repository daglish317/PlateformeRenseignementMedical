"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { hasGestionnairePermission } from "../permissions/permissions";

interface DashboardRouteProps {
  children: React.ReactNode;
  type: "HOPITAL" | "PHARMACIE";
}

export function DashboardRoute({ children, type }: DashboardRouteProps) {
  const { user, authenticated, hydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;

    if (!authenticated) {
      router.push("/connexion");
      return;
    }

    if (user && !hasGestionnairePermission(user.role)) {
      router.push("/");
    }
  }, [authenticated, hydrated, user, router]);

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!authenticated || !user || !hasGestionnairePermission(user.role)) {
    return null;
  }

  return <>{children}</>;
}
