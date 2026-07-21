"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useManagersStore } from "../store/managers-store";

export function ManagerSearch() {
  const { filters, setFilters } = useManagersStore();

  return (
    <div className="relative flex-1">
      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Rechercher un gestionnaire..."
        value={filters.search}
        onChange={(e) => setFilters({ search: e.target.value })}
        className="pl-9"
      />
    </div>
  );
}
