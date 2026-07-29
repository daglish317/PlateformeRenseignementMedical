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
import { ServiceTypeBadge } from "./ServiceTypeBadge";
import { ServiceStatusBadge } from "./ServiceStatusBadge";
import { ServiceActions } from "./ServiceActions";
import { EditServiceDialog } from "./EditServiceDialog";
import { DeleteServiceDialog } from "./DeleteServiceDialog";
import { AdminEmptyState } from "../../shared/components/AdminEmptyState";
import { useServices } from "../hooks/useServices";
import { useServiceStore } from "../store/service-store";
import type { Service } from "../types/service";

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

export function ServiceTable() {
  const { filters } = useServiceStore();
  const { data, isLoading, isError, refetch } = useServices(filters);

  const [editTarget, setEditTarget] = useState<Service | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);

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

  const services = data ?? [];

  if (!isLoading && services.length === 0) {
    return (
      <AdminEmptyState
        title="Aucun service trouvé"
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
            services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>
                  <span className="font-medium">{service.nom}</span>
                </TableCell>
                <TableCell>
                  <ServiceTypeBadge type={service.type} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-sm text-muted-foreground line-clamp-1">
                    {service.description || "—"}
                  </span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <ServiceStatusBadge isActive={service.est_actif} />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(service.date_creation), "dd MMM yyyy", {
                      locale: fr,
                    })}
                  </span>
                </TableCell>
                <TableCell>
                  <ServiceActions
                    service={service}
                    onEdit={setEditTarget}
                    onDelete={setDeleteTarget}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <EditServiceDialog
        service={editTarget}
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
      />

      <DeleteServiceDialog
        service={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      />
    </>
  );
}
