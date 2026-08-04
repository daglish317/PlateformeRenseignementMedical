import { create } from "zustand";

import type { User } from "@/features/auth/types/user";
import type {
  AuthResponse,
  Tokens,
} from "@/features/auth/types/auth";

import { authStorage } from "@/features/auth/utils/auth-storage";

interface AuthState {
  user: User | null;

  accessToken: string | null;

  refreshToken: string | null;

  authenticated: boolean;

  hydrated: boolean;

  setHydrated: (value: boolean) => void;

  setAuth: (auth: AuthResponse) => void;

  setUser: (user: User | null) => void;

  setTokens: (tokens: Tokens) => void;

  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  accessToken: null,

  refreshToken: null,

  authenticated: false,

  hydrated: false,


  setHydrated: (value) =>
    set({
      hydrated: value,
    }),


  setAuth: (auth) => {
    authStorage.setTokens(auth.tokens);

    set({
      user: auth.user,
      accessToken: auth.tokens.access,
      refreshToken: auth.tokens.refresh,
      authenticated: true,
    });
  },


  setUser: (user) =>
    set({
      user,
    }),


  setTokens: (tokens) => {
    authStorage.setTokens(tokens);

    set((state) => ({
      user: state.user,
      accessToken: tokens.access,
      refreshToken: tokens.refresh,
      authenticated: true,
    }));
  },


  clearAuth: () => {
    const wasAuthenticated = useAuthStore.getState().authenticated;

    authStorage.removeTokens();

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      authenticated: false,
    });

    if (typeof window !== "undefined" && wasAuthenticated) {
      const pathname = window.location.pathname;
      if (!pathname.includes("/connexion") && !pathname.includes("/inscription")) {
        const locale = pathname.split("/")[1] === "en" ? "en" : "fr";
        window.location.href = `/${locale}/connexion`;
      }
    }
  },
}));
