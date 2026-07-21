import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { structuresService } from "../api/structures.service";

export function useRejectStructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, motif }: { id: string; motif: string }) =>
      structuresService.reject(id, motif),
    onSuccess: (data) => {
      toast.success(data.message || "Structure refusée");
      queryClient.invalidateQueries({ queryKey: ["admin", "structures"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
    onError: () => {
      toast.error("Impossible de refuser cette structure");
    },
  });
}
