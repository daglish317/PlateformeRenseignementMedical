"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useFeedbacksStore } from "../store/feedback-store";

export function FeedbackFilters() {
  const { filters, setFilters } = useFeedbacksStore();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un feedback..."
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
        <option value="NON_LU">Non lus</option>
        <option value="LU">Lus</option>
        <option value="TRAITE">Traités</option>
      </Select>
      <Select
        value={filters.categorie}
        onChange={(e) => setFilters({ categorie: e.target.value })}
      >
        <option value="">Toutes les catégories</option>
        <option value="BUG">Bug</option>
        <option value="SUGGESTION">Suggestion</option>
        <option value="SIGNALEMENT">Signalement</option>
        <option value="AUTRE">Autre</option>
      </Select>
    </div>
  );
}
