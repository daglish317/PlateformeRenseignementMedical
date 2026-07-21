"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useFeedbacksStore } from "../store/feedback-store";

export function FeedbackSearch() {
  const { filters, setFilters } = useFeedbacksStore();

  return (
    <div className="relative flex-1">
      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Rechercher un feedback..."
        value={filters.search}
        onChange={(e) => setFilters({ search: e.target.value })}
        className="pl-9"
      />
    </div>
  );
}
