"use client";

import SidebarHeader from "./SidebarHeader";
import EmergencyGrid from "./emergency/EmergencyGrid";
import SearchResults from "./results/SearchResults";

import type { SearchResult } from "@/types/search";

type SidebarProps = {
  results: SearchResult[];
  loading: boolean;
};

export default function Sidebar({
  results,
  loading,
}: SidebarProps) {
  return (
    <div
      className="
        flex
        h-full
        min-h-0
        flex-col
        bg-background
      "
    >
      {/* ===========================
          En-tête
      =========================== */}

      <div
        className="
          shrink-0
          border-b
          border-border
        "
      >
        <SidebarHeader />

        <EmergencyGrid />
      </div>

      {/* ===========================
          Résultats
      =========================== */}

      <section
        className="
          flex
          min-h-0
          flex-1
          flex-col
          overflow-hidden
        "
      >
        <div
          className="
            shrink-0
            border-b
            border-border
            px-6
            py-4
          "
        >
          <h2
            className="
              text-lg
              font-semibold
              tracking-tight
            "
          >
            Résultats de recherche
          </h2>
        </div>

        <div
          className="
            flex-1
            min-h-0
            overflow-y-auto
            px-6
            py-5
          "
        >
          <SearchResults
            results={results}
            loading={loading}
          />
        </div>
      </section>
    </div>
  );
}