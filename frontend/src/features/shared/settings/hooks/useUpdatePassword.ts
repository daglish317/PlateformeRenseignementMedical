import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { settingsService } from "../api/settings.service";
import type { ChangePasswordPayload } from "../types/settings";

export function useUpdatePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChangePasswordPayload) => settingsService.changePassword(data),
    onSuccess: (data) => {
      toast.success(data.message || "Mot de passe modifié avec succès");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => {
      toast.error("Impossible de modifier le mot de passe. Vérifiez l'ancien mot de passe.");
    },
  });
}
