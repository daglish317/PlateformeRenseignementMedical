"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageTitle } from "../../shared/components/AdminPageTitle";
import { CreateManagerDialog } from "../components/CreateManagerDialog";
import { ManagerFilters } from "../components/ManagerFilters";
import { ManagersTable } from "../components/ManagersTable";
import { useManagersStore } from "../store/managers-store";
import { useManagers } from "../hooks/useManagers";

export function ManagersPage() {
  const { filters, setFilters } = useManagersStore();
  const { data } = useManagers(filters);

  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / filters.pageSize);
  const canPrev = filters.page > 1;
  const canNext = filters.page < totalPages;

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Gestion des gestionnaires"
        subtitle="Création et gestion des comptes gestionnaires"
        actions={<CreateManagerDialog />}
      />

      <ManagerFilters />

      <ManagersTable page={filters.page} pageSize={filters.pageSize} />

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {total} résultat{total > 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ page: filters.page - 1 })}
              disabled={!canPrev}
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {filters.page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ page: filters.page + 1 })}
              disabled={!canNext}
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
