"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageTitle } from "../../shared/components/AdminPageTitle";
import { StructureFilters } from "../components/StructureFilters";
import { StructureTable } from "../components/StructureTable";
import { useStructures } from "../hooks/useStructures";
import { useStructuresStore } from "../store/structures-store";

export function StructuresPage() {
  const { filters } = useStructuresStore();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data } = useStructures({ ...filters, page, pageSize });
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex flex-col gap-6">
      <AdminPageTitle
        title="Gestion des structures"
        subtitle="Consultation, validation et refus des structures médicales"
      />

      <StructureFilters />

      <StructureTable page={page} pageSize={pageSize} />

      {total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} sur {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Suivant
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
