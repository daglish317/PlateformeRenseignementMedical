import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { managersService } from "../api/managers.service";

export function useResetPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => managersService.resetPassword(id),
    onSuccess: (data) => {
      toast.success(data.message || "Mot de passe réinitialisé avec succès");
      queryClient.invalidateQueries({ queryKey: ["admin", "managers"] });
    },
    onError: () => {
      toast.error("Impossible de réinitialiser le mot de passe");
    },
  });
}
