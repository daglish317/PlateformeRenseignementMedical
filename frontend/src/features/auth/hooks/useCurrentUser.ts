import { useQuery } from "@tanstack/react-query";

import { authService } from "@/features/auth/api/auth.service";
import { useAuthStore } from "@/features/auth/store/auth-store";

export const useCurrentUser = () => {
  const {
    user,
    authenticated,
    setUser,
  } = useAuthStore();


  return useQuery({
    queryKey: ["current-user"],


    queryFn: async () => {
      const currentUser = await authService.getMe();

      setUser(currentUser);

      return currentUser;
    },


    initialData: user ?? undefined,


    enabled: authenticated && !user,


    staleTime: 5 * 60 * 1000,


    retry: false,
  });
};