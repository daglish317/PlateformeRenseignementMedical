"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminEmptyState } from "../../shared/components/AdminEmptyState";
import { NotificationItem } from "./NotificationItem";
import { useNotifications } from "../hooks/useNotifications";
import { useNotificationsStore } from "../store/notifications-store";

export function NotificationList() {
  const { page, setPage, pageSize } = useNotificationsStore();
  const { data } = useNotifications();

  const notifications = data?.results ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (notifications.length === 0) {
    return (
      <AdminEmptyState
        title="Aucune notification"
        description="Vous n'avez aucune notification pour le moment."
      />
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}

      {total > 0 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Page {page} sur {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
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
