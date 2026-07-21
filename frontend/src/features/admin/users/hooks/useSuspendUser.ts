import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usersService } from "../api/users.service";

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersService.suspend(id),
    onSuccess: (data) => {
      toast.success(data.message || "Utilisateur suspendu avec succès");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
    onError: () => {
      toast.error("Impossible de suspendre cet utilisateur");
    },
  });
}
