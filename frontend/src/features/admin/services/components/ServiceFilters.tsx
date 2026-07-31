"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useServiceStore } from "../store/service-store";

export function ServiceFilters() {
  const { filters, setFilters } = useServiceStore();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un service..."
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          className="pl-9"
        />
      </div>
      <select
        value={filters.type}
        onChange={(e) => setFilters({ type: e.target.value })}
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
      >
        <option value="">Tous les types</option>
        <option value="MALADIE">Maladie</option>
        <option value="ANALYSE">Analyse</option>
        <option value="EXAMEN">Examen</option>
        <option value="SERVICE_MEDICAL">Service médical</option>
      </select>
    </div>
  );
}
