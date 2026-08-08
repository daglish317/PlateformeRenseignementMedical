"use client";
import { Button } from "@/components/ui/button";

interface StockFiltersProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

export function StockFilters({ currentFilter, onFilterChange }: StockFiltersProps) {
  const filters = [
    { key: "all", label: "Tous" },
    { key: "available", label: "Disponible" },
    { key: "low", label: "Stock faible" },
    { key: "out", label: "Rupture" },
  ];

  return (
    <div className="flex gap-2">
      {filters.map((f) => (
        <Button
          key={f.key}
          variant={currentFilter === f.key ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(f.key)}
        >
          {f.label}
        </Button>
      ))}
    </div>
  );
}
