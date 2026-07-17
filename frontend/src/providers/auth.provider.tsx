"use client";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useEffect } from "react";

function AuthInitializer() {
  const { authenticated, user } = useAuthStore();
  const { data: fetchedUser } = useCurrentUser();

  useEffect(() => {
    // If authenticated but no user data, fetch it
    if (authenticated && !user && fetchedUser) {
      useAuthStore.getState().setUser(fetchedUser);
    }
  }, [authenticated, user, fetchedUser]);

  return null;
}

type AuthProviderProps = {
  children: React.ReactNode;
};

export default function AuthProvider({
  children,
}: AuthProviderProps) {
  return (
    <>
      <AuthInitializer />
      {children}
    </>
  );
}