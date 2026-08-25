"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

import { useSearchStore } from "@/store/search-store";

import EmergencyGrid from "@/features/emergency/components/EmergencyGrid";
import EmergencyBanner from "@/features/emergency/components/EmergencyBanner";

const SearchResults = dynamic(() => import("./results/SearchResults"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col gap-3 px-4 py-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-xl border border-border bg-card p-4"
        >
          <div className="mb-3 h-4 w-2/3 rounded bg-muted" />
          <div className="mb-2 h-3 w-full rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted" />
        </div>
      ))}
    </div>
  ),
});

export default function Sidebar() {
  const query = useSearchStore((state) => state.query);
  const results = useSearchStore((state) => state.results);
  const loading = useSearchStore((state) => state.loading);
  const searchMode = useSearchStore((state) => state.searchMode);

  const searchResults = results?.results ?? [];
  const title = useMemo(
    () => (query.trim().length === 0 ? "Autour de vous" : "Résultats"),
    [query]
  );

  return (
    <aside className="flex h-full min-h-0 flex-col bg-background">
      {/* Zone supérieure : recherche + urgence */}
      <div className="shrink-0">
        <EmergencyBanner />

        {searchMode === "normal" && <EmergencyGrid />}
      </div>

      {/* Zone résultats */}
      <section className="flex min-h-0 flex-1 flex-col border-t border-border bg-muted/10">
        {/* Header résultats */}
        <div className="flex h-11 shrink-0 items-center justify-between border-b border-border px-4">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>

          {searchResults.length > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {searchResults.length}
            </span>
          )}
        </div>

        {/* Liste */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-3 pb-20 md:pb-3">
          <SearchResults results={searchResults} loading={loading} />
        </div>
      </section>
    </aside>
  );
}
