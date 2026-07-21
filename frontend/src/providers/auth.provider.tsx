"use client";

import type { ReactNode } from "react";

import AuthInitializer from "@/features/auth/components/AuthInitializer";
import { useAuthStore } from "@/features/auth/store/auth-store";

type AuthProviderProps = {
  children: ReactNode;
};

export default function AuthProvider({
  children,
}: AuthProviderProps) {

  const hydrated = useAuthStore(
    (state) => state.hydrated
  );

  return (
    <>
      <AuthInitializer />

      {hydrated ? (
        children
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          Chargement...
        </div>
      )}
    </>
  );
}