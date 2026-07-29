import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { serviceService } from "../api/service.service";

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{ nom: string; type: string; description: string; categorie: string }>;
    }) => serviceService.update(id, data),
    onSuccess: () => {
      toast.success("Service mis à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ["admin", "services"] });
    },
    onError: () => {
      toast.error("Impossible de modifier ce service");
    },
  });
}
