"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "./UserAvatar";
import { UserStatusBadge } from "./UserStatusBadge";
import { UserActions } from "./UserActions";
import { UserDetails } from "./UserDetails";
import { SuspendUserDialog } from "./SuspendUserDialog";
import { ReactivateUserDialog } from "./ReactivateUserDialog";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { AdminEmptyState } from "../../shared/components/AdminEmptyState";
import { useUsers } from "../hooks/useUsers";
import { useUsersStore } from "../store/users-store";
import type { UserAdmin } from "../types/user";

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-10 w-10 rounded-lg" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
          <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-7 w-20" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function UsersTable() {
  const { filters } = useUsersStore();
  const { data, isLoading, isError, refetch } = useUsers(filters);

  const [detailUser, setDetailUser] = useState<UserAdmin | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<UserAdmin | null>(null);
  const [reactivateTarget, setReactivateTarget] = useState<UserAdmin | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserAdmin | null>(null);

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

  const users = data?.results ?? [];

  if (!isLoading && users.length === 0) {
    return (
      <AdminEmptyState
        title="Aucun utilisateur trouvé"
        description="Aucun utilisateur ne correspond à vos critères de recherche."
      />
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Avatar</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden sm:table-cell">Inscrit le</TableHead>
            <TableHead className="hidden lg:table-cell">Dernière connexion</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <UserAvatar nom={user.nom} />
                </TableCell>
                <TableCell>
                  <span className="font-medium">{user.nom}</span>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(user.date_joined), "dd MMM yyyy", { locale: fr })}
                  </span>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {user.last_login
                      ? format(new Date(user.last_login), "dd MMM yyyy", { locale: fr })
                      : "—"}
                  </span>
                </TableCell>
                <TableCell>
                  <UserStatusBadge isActive={user.is_active} />
                </TableCell>
                <TableCell>
                  <UserActions
                    user={user}
                    onView={setDetailUser}
                    onSuspend={setSuspendTarget}
                    onReactivate={(u) => {
                      setDetailUser(null);
                      setReactivateTarget(u);
                    }}
                    onDelete={setDeleteTarget}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <UserDetails
        user={detailUser}
        open={!!detailUser}
        onOpenChange={(open) => { if (!open) setDetailUser(null); }}
      />

      <SuspendUserDialog
        user={suspendTarget}
        open={!!suspendTarget}
        onOpenChange={(open) => { if (!open) setSuspendTarget(null); }}
      />

      <ReactivateUserDialog
        user={reactivateTarget}
        open={!!reactivateTarget}
        onOpenChange={(open) => { if (!open) setReactivateTarget(null); }}
      />

      <DeleteUserDialog
        user={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
      />
    </>
  );
}
