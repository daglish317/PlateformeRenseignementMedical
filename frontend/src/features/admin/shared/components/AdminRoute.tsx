"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { authService } from "@/features/auth/api/auth.service";
import { hasAdminPermission } from "../navigation/permissions";
import { AdminLoading } from "./AdminLoading";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const router = useRouter();
  const authenticated = useAuthStore((state) => state.authenticated);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    if (!authenticated) {
      router.replace("/connexion");
      return;
    }

    if (!user) {
      authService.getMe().then((userData) => {
        setUser(userData);
        if (!hasAdminPermission(userData.role)) {
          router.replace("/");
        }
      }).catch(() => {
        router.replace("/connexion");
      });
      return;
    }

    if (!hasAdminPermission(user.role)) {
      router.replace("/");
    }
  }, [authenticated, user, router, setUser]);

  if (!authenticated) {
    return null;
  }

  if (!user) {
    return <AdminLoading label="Vérification des accès..." />;
  }

  if (!hasAdminPermission(user.role)) {
    return null;
  }

  return <>{children}</>;
}
