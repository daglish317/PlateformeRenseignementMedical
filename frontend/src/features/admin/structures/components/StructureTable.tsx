"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Hospital, Pill } from "lucide-react";
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
import { StructureStatusBadge } from "./StructureStatusBadge";
import { StructurePhoto } from "./StructurePhoto";
import { StructureActions } from "./StructureActions";
import { StructureDetails } from "./StructureDetails";
import { ValidateDialog } from "./ValidateDialog";
import { RejectDialog } from "./RejectDialog";
import { AdminEmptyState } from "../../shared/components/AdminEmptyState";
import { useStructures } from "../hooks/useStructures";
import { useStructuresStore } from "../store/structures-store";
import type { StructureAdmin, StructureType } from "../types/structure";

function TypeIcon({ type }: { type: StructureType }) {
  if (type === "HOPITAL") return <Hospital className="h-4 w-4 text-red-500" />;
  return <Pill className="h-4 w-4 text-green-500" />;
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-10 w-10 rounded-lg" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
          <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-7 w-20" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

interface StructureTableProps {
  page: number;
  pageSize: number;
}

export function StructureTable({ page, pageSize }: StructureTableProps) {
  const { filters } = useStructuresStore();
  const { data, isLoading, isError, refetch } = useStructures({ ...filters, page, pageSize });

  const [detailStructure, setDetailStructure] = useState<StructureAdmin | null>(null);
  const [validateTarget, setValidateTarget] = useState<StructureAdmin | null>(null);
  const [rejectTarget, setRejectTarget] = useState<StructureAdmin | null>(null);

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

  const structures = data?.results ?? [];

  if (!isLoading && structures.length === 0) {
    return (
      <AdminEmptyState
        title="Aucune structure trouvée"
        description="Aucune structure ne correspond à vos critères de recherche."
      />
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Photo</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="hidden md:table-cell">Adresse</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="hidden sm:table-cell">Date</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            structures.map((structure) => (
              <TableRow key={structure.id}>
                <TableCell>
                  <StructurePhoto photo={structure.photo} nom={structure.nom} />
                </TableCell>
                <TableCell>
                  <span className="font-medium">{structure.nom}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <TypeIcon type={structure.type} />
                    <span className="text-sm">
                      {structure.type === "HOPITAL" ? "Hôpital" : "Pharmacie"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
                    {structure.adresse}
                  </span>
                </TableCell>
                <TableCell>
                  <StructureStatusBadge statut={structure.statut} />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(structure.date_creation), "dd MMM yyyy", { locale: fr })}
                  </span>
                </TableCell>
                <TableCell>
                  <StructureActions
                    structure={structure}
                    onView={setDetailStructure}
                    onValidate={setValidateTarget}
                    onReject={setRejectTarget}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <StructureDetails
        structure={detailStructure}
        open={!!detailStructure}
        onOpenChange={(open) => { if (!open) setDetailStructure(null); }}
        onValidate={(s) => { setDetailStructure(null); setValidateTarget(s); }}
        onReject={(s) => { setDetailStructure(null); setRejectTarget(s); }}
      />

      <ValidateDialog
        structure={validateTarget}
        open={!!validateTarget}
        onOpenChange={(open) => { if (!open) setValidateTarget(null); }}
      />

      <RejectDialog
        structure={rejectTarget}
        open={!!rejectTarget}
        onOpenChange={(open) => { if (!open) setRejectTarget(null); }}
      />
    </>
  );
}
