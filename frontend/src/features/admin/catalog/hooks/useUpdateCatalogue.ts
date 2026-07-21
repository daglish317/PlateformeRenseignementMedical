import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { catalogService } from "../api/catalog.service";

export function useUpdateCatalogue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{ nom: string; type: string; description: string }>;
    }) => catalogService.update(id, data),
    onSuccess: () => {
      toast.success("Catalogue mis à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ["admin", "catalogues"] });
    },
    onError: () => {
      toast.error("Impossible de modifier ce catalogue");
    },
  });
}
