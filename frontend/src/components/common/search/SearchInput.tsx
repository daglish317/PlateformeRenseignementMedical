"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type SearchInputProps = {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onFocus: () => void;
};

export default function SearchInput({
  value,
  placeholder = "Rechercher une structure, un service médical...",
  onChange,
  onFocus,
}: SearchInputProps) {
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

      <Input
        value={value}
        onFocus={onFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="h-12 rounded-2xl border-border pl-12 pr-4 text-base shadow-sm transition-all focus-visible:ring-2"
      />
    </div>
  );
}