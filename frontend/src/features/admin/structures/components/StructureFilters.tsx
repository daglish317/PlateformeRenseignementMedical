"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useStructuresStore } from "../store/structures-store";

export function StructureFilters() {
  const { filters, setFilters } = useStructuresStore();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher une structure..."
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
        <option value="EN_ATTENTE">En attente</option>
        <option value="ACTIVE">Active</option>
        <option value="REFUSEE">Refusée</option>
      </Select>
      <Select
        value={filters.type}
        onChange={(e) => setFilters({ type: e.target.value })}
      >
        <option value="">Tous les types</option>
        <option value="HOPITAL">Hôpital</option>
        <option value="PHARMACIE">Pharmacie</option>
      </Select>
      <Select
        value={filters.ordering}
        onChange={(e) => setFilters({ ordering: e.target.value })}
      >
        <option value="-date_creation">Date (récent)</option>
        <option value="date_creation">Date (ancien)</option>
        <option value="nom">Nom A-Z</option>
        <option value="-nom">Nom Z-A</option>
      </Select>
    </div>
  );
}
