"use client";

import { Loader2, SearchX, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import StructureCard from "./StructureCard";
import { useSearchStore } from "@/store/search-store";
import type { SearchResult } from "@/types/search";

type SearchResultsProps = {
  results: SearchResult[];
  loading: boolean;
};

export default function SearchResults({
  results,
  loading,
}: SearchResultsProps) {
  const storePage = useSearchStore((state) => state.page);
  const setPage = useSearchStore((state) => state.setPage);
  const total = useSearchStore((state) => state.results?.total ?? 0);
  const pageSize = useSearchStore((state) => state.results?.page_size ?? 20);

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Recherche en cours...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="flex max-w-xs flex-col items-center text-center">
          <SearchX className="mb-3 h-10 w-10 text-muted-foreground" />
          <h3 className="text-base font-semibold">Aucun résultat</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Lancez une recherche ou choisissez une urgence médicale.
          </p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(total / pageSize);
  const isFirstPage = storePage <= 1;
  const isLastPage = storePage >= totalPages;

  return (
    <div className="flex flex-col gap-3">
      {results.map((result) => (
        <StructureCard
          key={result.structure.id}
          result={result}
        />
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs"
            disabled={isFirstPage}
            onClick={() => setPage(storePage - 1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Précédent
          </Button>

          <span className="text-xs text-muted-foreground">
            Page {storePage} / {totalPages}
          </span>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs"
            disabled={isLastPage}
            onClick={() => setPage(storePage + 1)}
          >
            Suivant
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}