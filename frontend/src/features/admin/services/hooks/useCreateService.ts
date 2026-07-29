import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { serviceService } from "../api/service.service";

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { nom: string; type: string; description: string; categorie?: string }) =>
      serviceService.create(data),
    onSuccess: () => {
      toast.success("Service créé avec succès");
      queryClient.invalidateQueries({ queryKey: ["admin", "services"] });
    },
    onError: () => {
      toast.error("Impossible de créer ce service");
    },
  });
}
