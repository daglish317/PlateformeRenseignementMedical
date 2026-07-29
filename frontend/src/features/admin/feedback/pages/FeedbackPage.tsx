"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Inbox, MailOpen, CheckCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageTitle } from "../../shared/components/AdminPageTitle";
import { FeedbackFilters } from "../components/FeedbackFilters";
import { FeedbackTable } from "../components/FeedbackTable";
import { useFeedbacksStore } from "../store/feedback-store";
import { useFeedbacks } from "../hooks/useFeedbacks";
import { useFeedbackStats } from "../hooks/useFeedbackStats";

export function FeedbackPage() {
  const queryClient = useQueryClient();
  const { filters, setFilters } = useFeedbacksStore();
  useFeedbacks(filters);
  const { data: stats } = useFeedbackStats();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["unread-counts"] });
  }, [queryClient]);

  const total = stats?.total ?? 0;
  const totalPages = Math.ceil(total / filters.pageSize);
  const canPrev = filters.page > 1;
  const canNext = filters.page < totalPages;

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Gestion des feedbacks"
        subtitle="Retours et suggestions des utilisateurs"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <Inbox className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats?.total ?? 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-sm text-muted-foreground">Non lus</p>
              <p className="text-2xl font-bold">{stats?.non_lus ?? 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <MailOpen className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Lus</p>
              <p className="text-2xl font-bold">{stats?.lus ?? 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-sm text-muted-foreground">Traités</p>
              <p className="text-2xl font-bold">{stats?.traites ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      <FeedbackFilters />

      <FeedbackTable page={filters.page} pageSize={filters.pageSize} />

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
