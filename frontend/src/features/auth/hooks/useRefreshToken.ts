import { useMutation } from "@tanstack/react-query";
import { tokenService } from "@/features/auth/api/token.service";
import { useAuthStore } from "@/features/auth/store/auth-store";

export const useRefreshToken = () => {
  const setTokens = useAuthStore((state) => state.setTokens);

  return useMutation({
    mutationFn: () => tokenService.refreshToken(),
    onSuccess: (tokens) => {
      setTokens(tokens);
    },
  });
};
