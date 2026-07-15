"use client";

import { Loader2, SearchX } from "lucide-react";

import StructureCard from "./StructureCard";

import type { SearchResult } from "@/types/search";

type SearchResultsProps = {
  results: SearchResult[];
  loading: boolean;
};

export default function SearchResults({
  results,
  loading,
}: SearchResultsProps) {
  if (loading) {
    return (
      <div
        className="
          flex
          h-full
          min-h-[300px]
          items-center
          justify-center
        "
      >
        <div
          className="
            flex
            flex-col
            items-center
            gap-4
            text-muted-foreground
          "
        >
          <Loader2 className="h-8 w-8 animate-spin" />

          <p className="text-sm">
            Recherche en cours...
          </p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div
        className="
          flex
          h-full
          min-h-[300px]
          items-center
          justify-center
        "
      >
        <div
          className="
            flex
            max-w-xs
            flex-col
            items-center
            text-center
          "
        >
          <SearchX
            className="
              mb-4
              h-12
              w-12
              text-muted-foreground
            "
          />

          <h3 className="text-lg font-semibold">
            Aucun résultat
          </h3>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-muted-foreground
            "
          >
            Lancez une recherche ou choisissez
            une urgence médicale.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        flex
        flex-col
        gap-5
      "
    >
      {results.map((result) => (
        <StructureCard
          key={result.structure.id}
          result={result}
        />
      ))}
    </div>
  );
}