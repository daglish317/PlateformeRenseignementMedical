import { create } from "zustand";
import { User } from "@/features/auth/types/user";
import { Tokens, AuthResponse } from "@/features/auth/types/auth";
import { authStorage } from "@/features/auth/utils/auth-storage";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  authenticated: boolean;
  setAuth: (authResponse: AuthResponse) => void;
  setUser: (user: User) => void;
  setTokens: (tokens: Tokens) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Initialize from storage on mount (client side)
  const accessToken = typeof window !== "undefined" ? authStorage.getAccessToken() : null;
  const refreshToken = typeof window !== "undefined" ? authStorage.getRefreshToken() : null;

  return {
    user: null,
    accessToken,
    refreshToken,
    authenticated: !!accessToken,

    setAuth: (authResponse: AuthResponse) => {
      authStorage.setTokens(authResponse.tokens);
      set({
        user: authResponse.user,
        accessToken: authResponse.tokens.access,
        refreshToken: authResponse.tokens.refresh,
        authenticated: true,
      });
    },

    setUser: (user: User) => {
      set({ user });
    },

    setTokens: (tokens: Tokens) => {
      authStorage.setTokens(tokens);
      set({
        accessToken: tokens.access,
        refreshToken: tokens.refresh,
      });
    },

    clearAuth: () => {
      authStorage.removeTokens();
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        authenticated: false,
      });
    },
  };
});
