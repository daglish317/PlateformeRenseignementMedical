import { useMutation } from "@tanstack/react-query";
import { authService } from "@/features/auth/api/auth.service";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { LoginCredentials } from "@/features/auth/types/auth";

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      setAuth(data);
    },
  });
};
