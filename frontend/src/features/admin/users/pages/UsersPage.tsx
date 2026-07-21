"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageTitle } from "../../shared/components/AdminPageTitle";
import { UserFilters } from "../components/UserFilters";
import { UsersTable } from "../components/UsersTable";
import { useUsersStore } from "../store/users-store";
import { useUsers } from "../hooks/useUsers";

export function UsersPage() {
  const { filters, setFilters } = useUsersStore();
  const { data } = useUsers(filters);

  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / filters.pageSize);
  const canPrev = filters.page > 1;
  const canNext = filters.page < totalPages;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageTitle
        title="Utilisateurs publics"
        subtitle="Consultation et gestion des comptes patients"
      />

      <UserFilters />

      <div className="rounded-lg border">
        <UsersTable />
      </div>

      {total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {total} résultat{total > 1 ? "s" : ""} au total
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!canPrev}
              onClick={() => setFilters({ page: filters.page - 1 })}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {filters.page} / {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!canNext}
              onClick={() => setFilters({ page: filters.page + 1 })}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
