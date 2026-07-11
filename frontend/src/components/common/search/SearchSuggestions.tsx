"use client";

import SearchItem from "./SearchItem";
import { Suggestion } from "@/hooks/useSuggestions";

type SearchSuggestionsProps = {
  suggestions: Suggestion[];
  onSelect: (value: string) => void;
};

export default function SearchSuggestions({
  suggestions,
  onSelect,
}: SearchSuggestionsProps) {
  if (suggestions.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-sm text-muted-foreground">
        Aucun résultat trouvé.
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Suggestions
      </div>

      {suggestions.map((item) => (
        <SearchItem
          key={item.id}
          nom={item.nom}
          type={item.type}
          onClick={() => onSelect(item.nom)}
        />
      ))}
    </div>
  );
}