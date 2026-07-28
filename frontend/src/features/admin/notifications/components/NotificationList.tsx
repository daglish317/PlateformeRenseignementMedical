"use client";

import { AdminEmptyState } from "../../shared/components/AdminEmptyState";
import { NotificationItem } from "./NotificationItem";
import { useNotifications } from "../hooks/useNotifications";

export function NotificationList() {
  const { data } = useNotifications();

  const notifications = data ?? [];

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
    </div>
  );
}
