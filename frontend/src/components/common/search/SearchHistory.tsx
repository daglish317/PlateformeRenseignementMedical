"use client";

import { Clock3, Trash2, X } from "lucide-react";

type SearchHistoryProps = {
  history: string[];
  onSelect: (query: string) => void;
  onRemove: (query: string) => void;
  onClear: () => void;
};

export default function SearchHistory({
  history,
  onSelect,
  onRemove,
  onClear,
}: SearchHistoryProps) {
  const normalizedHistory = Array.from(
    new Map(
      history
        .map((query) => query.trim())
        .filter(Boolean)
        .map((query) => [query.toLowerCase(), query])
    ).values()
  );

  if (history.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-sm text-muted-foreground">
        Aucune recherche récente.
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="mb-2 flex items-center justify-between px-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Recherches récentes
        </span>

        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Tout effacer
        </button>
      </div>

      <ul>
        {normalizedHistory.map((query) => (
          <li key={query.toLowerCase()}>
            <div className="group flex items-center justify-between px-4 py-2 transition-colors hover:bg-muted/60">
              <button
                type="button"
                onClick={() => onSelect(query)}
                className="flex flex-1 items-center gap-3 text-left"
              >
                <Clock3 className="h-4 w-4 text-muted-foreground" />

                <span className="truncate text-sm">
                  {query}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onRemove(query)}
                className="rounded-md p-1 opacity-0 transition-all hover:bg-background group-hover:opacity-100"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
