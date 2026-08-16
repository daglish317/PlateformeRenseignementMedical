"use client";

import { useTranslations } from "next-intl";
import SearchItem from "./SearchItem";
import { Suggestion } from "@/types/search";

type SearchSuggestionsProps = {
  suggestions: Suggestion[];
  onSelect: (value: string) => void;
};

export default function SearchSuggestions({
  suggestions,
  onSelect,
}: SearchSuggestionsProps) {
  const t = useTranslations("search");

  if (suggestions.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-sm text-muted-foreground">
        {t("noResults")}
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("suggestions")}
      </div>

      {suggestions.map((item, index) => (
        <SearchItem
          key={`${item.text}-${index}`}
          nom={item.text}
          type={item.type}
          onClick={() => onSelect(item.text)}
        />
      ))}
    </div>
  );
}