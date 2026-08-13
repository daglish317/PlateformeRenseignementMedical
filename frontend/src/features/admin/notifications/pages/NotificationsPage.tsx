"use client";

import { useEffect } from "react";
import { AdminPageTitle } from "../../shared/components/AdminPageTitle";
import { SendNotificationDialog } from "../components/SendNotificationDialog";
import { WeeklyReminderButton } from "../components/WeeklyReminderButton";
import { NotificationList } from "../components/NotificationList";
import { useNotifications } from "@/providers/notification.provider";
import { useAuthStore } from "@/features/auth/store/auth-store";

export function NotificationsPage() {
  const { markAllRead } = useNotifications();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "ADMINISTRATEUR";

  useEffect(() => {
    markAllRead("notifications");
  }, [markAllRead]);

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Notifications"
        subtitle={isAdmin ? "Envoyer des notifications aux gestionnaires" : "Vos notifications"}
        actions={
          isAdmin ? (
            <div className="flex gap-2">
              <WeeklyReminderButton />
              <SendNotificationDialog />
            </div>
          ) : undefined
        }
      />
      <NotificationList />
    </div>
  );
}
