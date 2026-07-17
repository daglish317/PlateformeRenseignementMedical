import { useQuery } from "@tanstack/react-query";
import { authService } from "@/features/auth/api/auth.service";
import { useAuthStore } from "@/features/auth/store/auth-store";

export const useCurrentUser = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const authenticated = useAuthStore((state) => state.authenticated);

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const userData = await authService.getMe();
      setUser(userData);
      return userData;
    },
    initialData: user ?? undefined,
    enabled: authenticated && !user,
  });
};
