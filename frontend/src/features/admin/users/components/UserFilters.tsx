"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUsersStore } from "../store/users-store";

export function UserFilters() {
  const { filters, setFilters } = useUsersStore();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un utilisateur..."
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          className="pl-9"
        />
      </div>
      <select
        value={filters.statut}
        onChange={(e) => setFilters({ statut: e.target.value })}
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
      >
        <option value="">Tous les statuts</option>
        <option value="active">Actif</option>
        <option value="inactive">Suspendu</option>
      </select>
      <select
        value={filters.ordering}
        onChange={(e) => setFilters({ ordering: e.target.value })}
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
      >
        <option value="-date_joined">Date (récent)</option>
        <option value="date_joined">Date (ancien)</option>
        <option value="nom">Nom A-Z</option>
        <option value="-nom">Nom Z-A</option>
      </select>
    </div>
  );
}
