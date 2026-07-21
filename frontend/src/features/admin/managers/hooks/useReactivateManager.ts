import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { managersService } from "../api/managers.service";

export function useReactivateManager() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => managersService.reactivate(id),
    onSuccess: (data) => {
      toast.success(data.message || "Gestionnaire réactivé avec succès");
      queryClient.invalidateQueries({ queryKey: ["admin", "managers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
    onError: () => {
      toast.error("Impossible de réactiver ce gestionnaire");
    },
  });
}
