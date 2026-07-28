export interface AdminNotification {
  id: string;
  titre: string;
  message: string;
  type: string;
  nav_item: string;
  date_creation: string;
  est_lue: boolean;
  structure: string | null;
}

export interface SendNotificationPayload {
  titre: string;
  message: string;
  type?: string;
  nav_item?: string;
}
