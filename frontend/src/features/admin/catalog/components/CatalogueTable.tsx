"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CatalogueTypeBadge } from "./CatalogueTypeBadge";
import { CatalogueStatusBadge } from "./CatalogueStatusBadge";
import { CatalogueActions } from "./CatalogueActions";
import { EditCatalogueDialog } from "./EditCatalogueDialog";
import { DeleteCatalogueDialog } from "./DeleteCatalogueDialog";
import { AdminEmptyState } from "../../shared/components/AdminEmptyState";
import { useCatalogues } from "../hooks/useCatalogues";
import { useToggleCatalogue } from "../hooks/useToggleCatalogue";
import { useCatalogStore } from "../store/catalog-store";
import type { Catalogue } from "../types/catalog";

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20 rounded-full" />
          </TableCell>
          <TableCell className="hidden md:table-cell">
            <Skeleton className="h-4 w-48" />
          </TableCell>
          <TableCell className="hidden sm:table-cell">
            <Skeleton className="h-5 w-16 rounded-full" />
          </TableCell>
          <TableCell className="hidden lg:table-cell">
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-7 w-20" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function CatalogueTable() {
  const { filters } = useCatalogStore();
  const { data, isLoading, isError, refetch } = useCatalogues(filters);
  const toggleCatalogue = useToggleCatalogue();

  const [editTarget, setEditTarget] = useState<Catalogue | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Catalogue | null>(null);

  function handleToggle(catalogue: Catalogue) {
    toggleCatalogue.mutate({
      id: catalogue.id,
      activate: !catalogue.est_actif,
    });
  }

  if (isError) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Erreur lors du chargement.
        <Button variant="link" onClick={() => refetch()} className="ml-1">
          Réessayer
        </Button>
      </div>
    );
  }

  const catalogues = data?.results ?? [];

  if (!isLoading && catalogues.length === 0) {
    return (
      <AdminEmptyState
        title="Aucun catalogue trouvé"
        description="Aucun élément ne correspond à vos critères de recherche."
      />
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="hidden md:table-cell">Description</TableHead>
            <TableHead className="hidden sm:table-cell">Statut</TableHead>
            <TableHead className="hidden lg:table-cell">Créé le</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            catalogues.map((catalogue) => (
              <TableRow key={catalogue.id}>
                <TableCell>
                  <span className="font-medium">{catalogue.nom}</span>
                </TableCell>
                <TableCell>
                  <CatalogueTypeBadge type={catalogue.type} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-sm text-muted-foreground line-clamp-1">
                    {catalogue.description || "—"}
                  </span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <CatalogueStatusBadge isActive={catalogue.est_actif} />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(catalogue.date_creation), "dd MMM yyyy", {
                      locale: fr,
                    })}
                  </span>
                </TableCell>
                <TableCell>
                  <CatalogueActions
                    catalogue={catalogue}
                    onEdit={setEditTarget}
                    onDelete={setDeleteTarget}
                    onToggle={handleToggle}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <EditCatalogueDialog
        catalogue={editTarget}
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
      />

      <DeleteCatalogueDialog
        catalogue={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      />
    </>
  );
}
