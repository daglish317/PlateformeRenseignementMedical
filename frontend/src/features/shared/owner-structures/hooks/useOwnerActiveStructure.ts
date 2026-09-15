"use client";

import { useEffect, useMemo } from "react";

import { useOwnerStructures } from "./useOwnerStructures";
import { useActiveStructureStore } from "../store/active-structure-store";
import type { OwnerStructure } from "../types/owner-structure";

type Result = {
  structure: OwnerStructure | null;
  structures: OwnerStructure[];
  isLoading: boolean;
};

export function useOwnerActiveStructure(enabled = true): Result {
  const { data, isLoading } = useOwnerStructures(enabled);
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

  useEffect(() => {
    if (isLoading) return;
    if (!activeStructureId && pharmacies.length > 0) {
      setActiveStructureId(pharmacies[0].id);
    }
  }, [activeStructureId, isLoading, pharmacies, setActiveStructureId]);

  const structure =
    (data?.results ?? []).find((s) => s.id === activeStructureId) ?? null;

  return {
    structure,
    structures: pharmacies,
    isLoading,
  };
}