import { useMutation } from "@tanstack/react-query";
import { authService } from "@/features/auth/api/auth.service";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { RegisterCredentials } from "@/features/auth/types/auth";

export const useRegister = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => authService.register(credentials),
    onSuccess: (data) => {
      setAuth(data);
    },
  });
};
