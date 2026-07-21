export interface AdminNotification {
  id: string;
  titre: string;
  contenu: string;
  type: string;
  date_creation: string;
  est_lue: boolean;
  destinataire: {
    id: string;
    nom: string;
    email: string;
  } | null;
}

export interface NotificationsListResponse {
  results: AdminNotification[];
  page: number;
  page_size: number;
  total: number;
}

export interface SendNotificationPayload {
  destinataire_id: string;
  titre: string;
  contenu: string;
  type: string;
}
