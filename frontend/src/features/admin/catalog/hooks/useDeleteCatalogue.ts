import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { catalogService } from "../api/catalog.service";

export function useDeleteCatalogue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => catalogService.delete(id),
    onSuccess: () => {
      toast.success("Catalogue supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ["admin", "catalogues"] });
    },
    onError: () => {
      toast.error("Impossible de supprimer ce catalogue");
    },
  });
}
