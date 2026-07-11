"use client";

import { Search } from "lucide-react";

type SearchItemProps = {
  nom: string;
  type: string;
  onClick: () => void;
};

export default function SearchItem({
  nom,
  type,
  onClick,
}: SearchItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted"
    >
      <Search className="h-4 w-4 text-primary" />

      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {nom}
        </span>

        <span className="text-xs text-muted-foreground">
          {type}
        </span>
      </div>
    </button>
  );
}