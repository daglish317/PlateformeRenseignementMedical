"use client";

import { useSearchStore } from "@/store/search-store";
import SidebarHeader from "./SidebarHeader";
import EmergencyGrid from "@/features/emergency/components/EmergencyGrid";
import EmergencyBanner from "@/features/emergency/components/EmergencyBanner";
import SearchResults from "./results/SearchResults";

export default function Sidebar() {
  const results = useSearchStore((state) => state.results);
  const loading = useSearchStore((state) => state.loading);
  const searchMode = useSearchStore((state) => state.searchMode);
  const searchResults = results?.results ?? [];

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* ===========================
          En-tête
      =========================== */}
      <div className="shrink-0 border-b border-border">
        <SidebarHeader />
        <EmergencyBanner />
        {searchMode === "normal" && <EmergencyGrid />}
      </div>

      {/* ===========================
          Résultats
      =========================== */}
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold tracking-tight">
            Résultats de recherche
          </h2>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
          <SearchResults results={searchResults} loading={loading} />
        </div>
      </section>
    </div>
  );
}