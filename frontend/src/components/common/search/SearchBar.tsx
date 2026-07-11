"use client";

import { useEffect, useRef, useState } from "react";

import SearchInput from "./SearchInput";
import SearchDropdown from "./SearchDropdown";
import SearchHistory from "./SearchHistory";
import SearchSuggestions from "./SearchSuggestions";

import { useSuggestions } from "@/hooks/useSuggestions";
import { useSearchHistory } from "@/hooks/useSearchHistory";

type SearchBarProps = {
  onSearch?: (query: string) => void;
};

export default function SearchBar({
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const {
    history,
    addSearch,
    removeSearch,
    clearHistory,
  } = useSearchHistory();

  const { data: suggestions = [] } = useSuggestions(query);

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
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  function submit(value: string) {
    const text = value.trim();

    if (!text) return;

    addSearch(text);

    setQuery(text);

    setOpen(false);

    onSearch?.(text);
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full"
    >
      <SearchInput
        value={query}
        onChange={(value) => {
          setQuery(value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
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
            <SearchSuggestions
              suggestions={suggestions}
              onSelect={submit}
            />
          )}
        </SearchDropdown>
      )}
    </div>
  );
}