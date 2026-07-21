"use client";
import { useCallback } from "react";

export function useImportStock() {
  const importFromFile = useCallback(async (_file: File) => {
    // TODO: implement Excel import
    throw new Error("Import Excel pas encore implémenté");
  }, []);

  return { importFromFile };
}
