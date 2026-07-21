"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { structureProfileService } from "../api/structure-profile.service";
import type { UpdateStructurePayload } from "../types/structure-profile";

export function useUpdateStructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStructurePayload }) =>
      structureProfileService.updateStructure(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["structure-profile"] });
    },
  });
}

export function useUploadPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      structureProfileService.uploadPhoto(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["structure-profile"] });
    },
  });
}

export function useDeletePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => structureProfileService.deletePhoto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["structure-profile"] });
    },
  });
}
