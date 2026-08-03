"use client";

import { useCallback, useState } from "react";

const STORAGE_KEY = "search-history";
const MAX_HISTORY = 10;

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      return stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
      return [];
    }
  });

  const saveHistory = useCallback((items: string[]) => {
    setHistory(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, []);

  const addSearch = useCallback(
    (query: string) => {
      const value = query.trim();

      if (!value) return;

      const updated = [
        value,
        ...history.filter(
          (item) => item.toLowerCase() !== value.toLowerCase()
        ),
      ].slice(0, MAX_HISTORY);

      saveHistory(updated);
    },
    [history, saveHistory]
  );

  const removeSearch = useCallback(
    (query: string) => {
      const updated = history.filter((item) => item !== query);

      saveHistory(updated);
    },
    [history, saveHistory]
  );

  const clearHistory = useCallback(() => {
    saveHistory([]);
  }, [saveHistory]);

  return {
    history,
    addSearch,
    removeSearch,
    clearHistory,
  };
}