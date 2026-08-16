"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Hospital, Pill } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ManagerStatusBadge } from "./ManagerStatusBadge";
import { ManagerActions } from "./ManagerActions";
import { ManagerDetails } from "./ManagerDetails";
import { SuspendDialog } from "./SuspendDialog";
import { ResetPasswordDialog } from "./ResetPasswordDialog";
import { ReactivateDialog } from "./ReactivateDialog";
import { AdminEmptyState } from "../../shared/components/AdminEmptyState";
import { useManagers } from "../hooks/useManagers";
import { useManagersStore } from "../store/managers-store";
import type { ManagerAdmin } from "../types/manager";

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
          <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-7 w-20" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

interface ManagersTableProps {
  page: number;
  pageSize: number;
}

export function ManagersTable({ page, pageSize }: ManagersTableProps) {
  const { filters } = useManagersStore();
  const { data, isLoading, isError, refetch } = useManagers({ ...filters, page, pageSize });

  const [detailManager, setDetailManager] = useState<ManagerAdmin | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<ManagerAdmin | null>(null);
  const [reactivateTarget, setReactivateTarget] = useState<ManagerAdmin | null>(null);
  const [resetTarget, setResetTarget] = useState<ManagerAdmin | null>(null);

  if (isError) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Erreur lors du chargement.
        <button onClick={() => refetch()} className="ml-1 text-primary underline">
          Réessayer
        </button>
      </div>
    );
  }

  const managers = data?.results ?? [];

  if (!isLoading && managers.length === 0) {
    return (
      <AdminEmptyState
        title="Aucun gestionnaire trouvé"
        description="Aucun gestionnaire ne correspond à vos critères de recherche."
      />
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="hidden md:table-cell">Structure</TableHead>
            <TableHead className="hidden sm:table-cell">Type</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="hidden sm:table-cell">Date</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            managers.map((manager) => (
              <TableRow key={manager.id}>
                <TableCell>
                  <span className="font-medium">{manager.nom}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{manager.email}</span>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {manager.structure ? (
                    <span className="text-sm">{manager.structure.nom}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {manager.structure ? (
                    <div className="flex items-center gap-1.5">
                      {manager.structure.type === "HOPITAL" ? (
                        <Hospital className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Pill className="h-4 w-4 text-emerald-600" />
                      )}
                      <span className="text-sm">
                        {manager.structure.type === "HOPITAL" ? "Hôpital" : "Pharmacie"}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <ManagerStatusBadge isActive={manager.is_active} />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(manager.date_joined), "dd MMM yyyy", { locale: fr })}
                  </span>
                </TableCell>
                <TableCell>
                  <ManagerActions
                    manager={manager}
                    onView={setDetailManager}
                    onSuspend={setSuspendTarget}
                    onReactivate={setReactivateTarget}
                    onResetPassword={setResetTarget}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <ManagerDetails
        manager={detailManager}
        open={!!detailManager}
        onOpenChange={(open) => { if (!open) setDetailManager(null); }}
      />

      <SuspendDialog
        manager={suspendTarget}
        open={!!suspendTarget}
        onOpenChange={(open) => { if (!open) setSuspendTarget(null); }}
      />

      <ReactivateDialog
        manager={reactivateTarget}
        open={!!reactivateTarget}
        onOpenChange={(open) => { if (!open) setReactivateTarget(null); }}
      />

      <ResetPasswordDialog
        manager={resetTarget}
        open={!!resetTarget}
        onOpenChange={(open) => { if (!open) setResetTarget(null); }}
      />
    </>
  );
}
