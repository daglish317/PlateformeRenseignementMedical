import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { catalogService } from "../api/catalog.service";

export function useToggleCatalogue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, activate }: { id: string; activate: boolean }) =>
      activate ? catalogService.activate(id) : catalogService.deactivate(id),
    onSuccess: () => {
      toast.success("Statut du catalogue mis à jour");
      queryClient.invalidateQueries({ queryKey: ["admin", "catalogues"] });
    },
    onError: () => {
      toast.error("Impossible de modifier le statut du catalogue");
    },
  });
}
