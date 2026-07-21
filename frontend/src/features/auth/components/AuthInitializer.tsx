"use client";

import { useEffect, useRef } from "react";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { authStorage } from "@/features/auth/utils/auth-storage";

export default function AuthInitializer() {
  const initialized = useRef(false);

  const {
    setTokens,
    clearAuth,
    setHydrated,
  } = useAuthStore();


  const {
    isLoading,
  } = useCurrentUser();


  useEffect(() => {
    if (initialized.current) {
      return;
    }

    initialized.current = true;


    const access = authStorage.getAccessToken();
    const refresh = authStorage.getRefreshToken();


    if (access && refresh) {
      setTokens({
        access,
        refresh,
      });
    } else {
      clearAuth();
      setHydrated(true);
    }

  }, [
    setTokens,
    clearAuth,
    setHydrated,
  ]);


  useEffect(() => {

    const {
      authenticated,
    } = useAuthStore.getState();


    if (!authenticated || !isLoading) {
      setHydrated(true);
    }

  }, [
    isLoading,
    setHydrated,
  ]);


  return null;
}