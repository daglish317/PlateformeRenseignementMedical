import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { structuresService } from "../api/structures.service";

export function useValidateStructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => structuresService.validate(id),
    onSuccess: (data) => {
      toast.success(data.message || "Structure validée avec succès");
      queryClient.invalidateQueries({ queryKey: ["admin", "structures"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
    onError: () => {
      toast.error("Impossible de valider cette structure");
    },
  });
}
