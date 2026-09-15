"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useOwnerStructures } from "@/features/shared/owner-structures/hooks/useOwnerStructures";
import { useActiveStructureStore } from "@/features/shared/owner-structures/store/active-structure-store";
import {
  MY_STRUCTURE_QUERY_KEY,
  useMyStructure,
} from "@/features/shared/structure-profile/hooks/useMyStructure";

export function useMyStructureId(enabled = true) {
  const user = useAuthStore((state) => state.user);
  const isOwner = user?.role === "PROPRIETAIRE";

  // Tous les hooks sont appelés inconditionnellement.
  const myStructure = useMyStructure(enabled && !isOwner);
  const { data: ownerStructures } = useOwnerStructures(isOwner && enabled);
  const activeStructureId = useActiveStructureStore(
    (state) => state.activeStructureId
  );

  const pharmacies = (ownerStructures?.results ?? []).filter(
    (s) => s.type === "PHARMACIE"
  );
  const fallbackId = pharmacies.find((s) => s.id === activeStructureId)?.id;
  const resolvedId =
    isOwner
      ? fallbackId ?? pharmacies[0]?.id ?? undefined
      : myStructure.data?.id;

  return useQuery({
    queryKey: ["my-structure-id", resolvedId ?? ""],
    queryFn: () => Promise.resolve(resolvedId as string),
    enabled: resolveEnabled(enabled, isOwner, resolvedId),
    initialData: resolvedId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    meta: {
      sourceQueryKey: MY_STRUCTURE_QUERY_KEY,
    },
  });
}

function resolveEnabled(enabled: boolean, isOwner: boolean, resolvedId: string | undefined) {
  if (isOwner) {
    return enabled && Boolean(resolvedId);
  }
  return Boolean(resolvedId);
}