"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import SearchInput from "./SearchInput";
import SearchDropdown from "./SearchDropdown";
import SearchHistory from "./SearchHistory";
import SearchSuggestions from "./SearchSuggestions";

import { useSuggestions } from "@/hooks/useSuggestions";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useSearchStore } from "@/store/search-store";
import { useSearch } from "@/hooks/useSearch";

export default function SearchBar() {
  const query = useSearchStore((state) => state.query);
  const setQuery = useSearchStore((state) => state.setQuery);
  const page = useSearchStore((state) => state.page);
  const [open, setOpen] = useState(false);

  const t = useTranslations("search");
  const containerRef = useRef<HTMLDivElement>(null);

  const { history, addSearch, removeSearch, clearHistory } = useSearchHistory();
  const { data: suggestions = [] } = useSuggestions(query);

  useSearch({ query, page });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function submit(value: string) {
    const text = value.trim();

    if (!text) return;

    addSearch(text);
    setQuery(text);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <SearchInput
        value={query}
        placeholder={t("placeholder")}
        onChange={(value) => {
          setQuery(value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            submit(query);
          }
        }}
      />

      {open && (
        <SearchDropdown>
          {query.trim() === "" ? (
            <SearchHistory
              history={history}
              onSelect={submit}
              onRemove={removeSearch}
              onClear={clearHistory}
            />
          ) : (
            <SearchSuggestions suggestions={suggestions} onSelect={submit} />
          )}
        </SearchDropdown>
      )}
    </div>
  );
}
