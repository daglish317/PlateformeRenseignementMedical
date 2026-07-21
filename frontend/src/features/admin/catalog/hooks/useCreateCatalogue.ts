import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { catalogService } from "../api/catalog.service";

export function useCreateCatalogue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { nom: string; type: string; description: string }) =>
      catalogService.create(data),
    onSuccess: () => {
      toast.success("Catalogue créé avec succès");
      queryClient.invalidateQueries({ queryKey: ["admin", "catalogues"] });
    },
    onError: () => {
      toast.error("Impossible de créer ce catalogue");
    },
  });
}
