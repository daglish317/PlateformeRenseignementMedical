"use client";

import { AdminPageTitle } from "../../shared/components/AdminPageTitle";
import { SendNotificationDialog } from "../components/SendNotificationDialog";
import { NotificationList } from "../components/NotificationList";

export function NotificationsPage() {
  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Notifications"
        subtitle="Gestion des alertes et notifications administrateur"
        actions={<SendNotificationDialog />}
      />

      <NotificationList />
    </div>
  );
}
