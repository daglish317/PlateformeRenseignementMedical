"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Loader2, SearchX } from "lucide-react";
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
  const storePage = useSearchStore((state) => state.page);
  const setPage = useSearchStore((state) => state.setPage);
  const hasNext = useSearchStore((state) => state.results?.has_next ?? false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Chargement progressif (§18-19) : dès que l'utilisateur approche de la fin
  // de la liste, le lot suivant est chargé et ajouté aux résultats existants.
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
          <p className="text-sm">{t("searching")}</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="flex max-w-xs flex-col items-center text-center">
          <SearchX className="mb-3 h-10 w-10 text-muted-foreground" />
          <h3 className="text-base font-semibold">{t("noResults")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("noResultsText")}
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
        <div
          ref={sentinelRef}
          className="flex items-center justify-center py-4"
        >
          {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
        </div>
      )}
    </div>
  );
}
