import { useMutation } from "@tanstack/react-query";
import { googleAuthService } from "@/features/auth/api/google-auth.service";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { GoogleCredentials } from "@/features/auth/types/auth";

export const useGoogleLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (credentials: GoogleCredentials) => googleAuthService.authenticate(credentials),
    onSuccess: (data) => {
      setAuth(data);
    },
  });
};
