import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { managersService } from "../api/managers.service";
import type { CreateAdminManagerPayload } from "../types/manager";

export function useCreateManager() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdminManagerPayload) => managersService.create(data),
    onSuccess: (data) => {
      toast.success(data.message || "Invitation creee avec succes");
      queryClient.invalidateQueries({ queryKey: ["admin", "managers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
    onError: () => {
      toast.error("Impossible de creer cette invitation");
    },
  });
}
