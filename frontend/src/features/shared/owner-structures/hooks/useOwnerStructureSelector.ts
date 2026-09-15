"use client";

import { useMemo } from "react";

import { useOwnerStructures } from "./useOwnerStructures";
import { useActiveStructureStore } from "../store/active-structure-store";

export function useOwnerStructureSelector() {
  const { data, isLoading } = useOwnerStructures();
  const activeStructureId = useActiveStructureStore(
    (state) => state.activeStructureId
  );
  const setActiveStructureId = useActiveStructureStore(
    (state) => state.setActiveStructureId
  );

  const pharmacies = useMemo(
    () => (data?.results ?? []).filter((s) => s.type === "PHARMACIE"),
    [data]
  );

  const structureId = activeStructureId || pharmacies[0]?.id || "";

  return {
    structureId,
    pharmacies,
    isLoading,
    setStructureId: setActiveStructureId,
  };
}