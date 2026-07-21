"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useManagersStore } from "../store/managers-store";

export function ManagerFilters() {
  const { filters, setFilters, resetFilters } = useManagersStore();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un gestionnaire..."
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          className="pl-9"
        />
      </div>
      <Select
        value={filters.statut}
        onChange={(e) => setFilters({ statut: e.target.value })}
      >
        <option value="">Tous les statuts</option>
        <option value="active">Actifs</option>
        <option value="suspendu">Suspendus</option>
      </Select>
      <Select
        value={filters.type_structure}
        onChange={(e) => setFilters({ type_structure: e.target.value })}
      >
        <option value="">Tous les types</option>
        <option value="HOPITAL">Hôpitaux</option>
        <option value="PHARMACIE">Pharmacies</option>
      </Select>
      <Button variant="outline" size="sm" onClick={resetFilters}>
        Réinitialiser
      </Button>
    </div>
  );
}
