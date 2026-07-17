import { useMutation } from "@tanstack/react-query";
import { authService } from "@/features/auth/api/auth.service";
import { useAuthStore } from "@/features/auth/store/auth-store";

export const useLogout = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const refreshToken = useAuthStore((state) => state.refreshToken);

  return useMutation({
    mutationFn: () => {
      if (refreshToken) {
        return authService.logout(refreshToken);
      }
      return Promise.resolve();
    },
    onSuccess: () => {
      clearAuth();
    },
    onError: () => {
      clearAuth(); // Clear auth even if logout fails
    },
  });
};
