import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { managersService } from "../api/managers.service";

export function useCreateManager() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { nom: string; email: string }) => managersService.create(data),
    onSuccess: (data) => {
      toast.success(data.message || "Gestionnaire créé avec succès");
      queryClient.invalidateQueries({ queryKey: ["admin", "managers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
    onError: () => {
      toast.error("Impossible de créer ce gestionnaire");
    },
  });
}
