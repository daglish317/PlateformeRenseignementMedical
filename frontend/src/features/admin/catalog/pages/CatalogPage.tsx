"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageTitle } from "../../shared/components/AdminPageTitle";
import { CreateCatalogueDialog } from "../components/CreateCatalogueDialog";
import { CatalogueFilters } from "../components/CatalogueFilters";
import { CatalogueTable } from "../components/CatalogueTable";
import { useCatalogStore } from "../store/catalog-store";
import { useCatalogues } from "../hooks/useCatalogues";

export function CatalogPage() {
  const { filters, setFilters } = useCatalogStore();
  const { data } = useCatalogues(filters);

  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / filters.pageSize);
  const canPrev = filters.page > 1;
  const canNext = filters.page < totalPages;

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Catalogue médical"
        subtitle="Gestion des éléments du catalogue"
        actions={<CreateCatalogueDialog />}
      />

      <CatalogueFilters />

      <div className="rounded-lg border">
        <CatalogueTable />
      </div>

      {total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {total} résultat{total > 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!canPrev}
              onClick={() => setFilters({ page: filters.page - 1 })}
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {filters.page} / {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!canNext}
              onClick={() => setFilters({ page: filters.page + 1 })}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
