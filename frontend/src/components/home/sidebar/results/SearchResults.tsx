"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Loader2, MapPin, SearchX } from "lucide-react";
import StructureCard from "./StructureCard";
import { useSearchStore } from "@/store/search-store";
import type { PublicPharmacieResult } from "@/types/search";

type SearchResultsProps = {
  results: PublicPharmacieResult[];
  loading: boolean;
};

export default function SearchResults({
  results,
  loading,
}: SearchResultsProps) {
  const t = useTranslations("search");
  const query = useSearchStore((state) => state.query);
  const storePage = useSearchStore((state) => state.page);
  const setPage = useSearchStore((state) => state.setPage);
  const hasNext = useSearchStore((state) => state.results?.has_next ?? false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasNext || loading) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage(storePage + 1);
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNext, loading, storePage, setPage]);

  if (loading && results.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">
            {query.trim().length === 0
              ? "Chargement des structures proches..."
              : t("searching")}
          </p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="flex max-w-xs flex-col items-center text-center">
          {query.trim().length === 0 ? (
            <MapPin className="mb-3 h-10 w-10 text-muted-foreground" />
          ) : (
            <SearchX className="mb-3 h-10 w-10 text-muted-foreground" />
          )}
          <h3 className="text-base font-semibold">
            {query.trim().length === 0
              ? "Aucune structure proche trouvée"
              : t("noResults")}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {query.trim().length === 0
              ? "Active la localisation pour afficher les structures ouvertes autour de toi."
              : t("noResultsText")}
          </p>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Seules les pharmacies validées, localisées, ouvertes et avec stock disponible sont affichées.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {results.map((result) => (
        <StructureCard key={result.id} result={result} />
      ))}

      {hasNext && (
        <div ref={sentinelRef} className="flex items-center justify-center py-4">
          {loading && (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          )}
        </div>
      )}
    </div>
  );
}
