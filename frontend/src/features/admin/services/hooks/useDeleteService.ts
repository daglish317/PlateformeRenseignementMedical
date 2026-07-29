import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { serviceService } from "../api/service.service";

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => serviceService.delete(id),
    onSuccess: () => {
      toast.success("Service supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ["admin", "services"] });
    },
    onError: () => {
      toast.error("Impossible de supprimer ce service");
    },
  });
}
