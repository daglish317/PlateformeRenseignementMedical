"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedbackStatusBadge } from "./FeedbackStatusBadge";
import { FeedbackCategoryBadge } from "./FeedbackCategoryBadge";
import { FeedbackActions } from "./FeedbackActions";
import { FeedbackDetails } from "./FeedbackDetails";
import { AdminEmptyState } from "../../shared/components/AdminEmptyState";
import { useFeedbacks } from "../hooks/useFeedbacks";
import { useUpdateFeedbackStatus } from "../hooks/useUpdateFeedbackStatus";
import { useDeleteFeedback } from "../hooks/useDeleteFeedback";
import { useFeedbacksStore } from "../store/feedback-store";
import type { FeedbackAdmin } from "../types/feedback";

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
          <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-7 w-20" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

interface FeedbackTableProps {
  page: number;
  pageSize: number;
}

export function FeedbackTable({ page, pageSize }: FeedbackTableProps) {
  const { filters } = useFeedbacksStore();
  const { data, isLoading, isError, refetch } = useFeedbacks({ ...filters, page, pageSize });
  const updateStatus = useUpdateFeedbackStatus();
  const deleteFeedback = useDeleteFeedback();

  const [detailFeedback, setDetailFeedback] = useState<FeedbackAdmin | null>(null);

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

  const feedbacks = data?.results ?? [];

  if (!isLoading && feedbacks.length === 0) {
    return (
      <AdminEmptyState
        title="Aucun feedback trouvé"
        description="Aucun feedback ne correspond à vos critères de recherche."
      />
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead className="hidden md:table-cell">Sujet</TableHead>
            <TableHead className="hidden sm:table-cell">Date</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            feedbacks.map((feedback) => (
              <TableRow key={feedback.id}>
                <TableCell>
                  <span className="font-medium">{feedback.utilisateur_nom}</span>
                </TableCell>
                <TableCell>
                  <FeedbackCategoryBadge categorie={feedback.categorie} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-sm text-muted-foreground">{feedback.sujet}</span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(feedback.date_creation), "dd MMM yyyy", { locale: fr })}
                  </span>
                </TableCell>
                <TableCell>
                  <FeedbackStatusBadge statut={feedback.statut} />
                </TableCell>
                <TableCell>
                  <FeedbackActions
                    feedback={feedback}
                    onView={setDetailFeedback}
                    onMarkRead={(id) => updateStatus.mutate({ id, action: "markAsRead" })}
                    onMarkTreated={(id) => updateStatus.mutate({ id, action: "markAsTreated" })}
                    onDelete={(id) => deleteFeedback.mutate(id)}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <FeedbackDetails
        feedback={detailFeedback}
        open={!!detailFeedback}
        onOpenChange={(open) => { if (!open) setDetailFeedback(null); }}
      />
    </>
  );
}
