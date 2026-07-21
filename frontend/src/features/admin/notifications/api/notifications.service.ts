import api from "@/lib/axios";
import type {
  AdminNotification,
  NotificationsListResponse,
  SendNotificationPayload,
} from "../types/notification";

export const notificationsService = {
  list: async (params: Record<string, string | number>): Promise<NotificationsListResponse> => {
    const response = await api.get<NotificationsListResponse>("/notifications/", { params });
    return response.data;
  },

  markAsRead: async (id: string): Promise<AdminNotification> => {
    const response = await api.post<AdminNotification>(`/notifications/read/${id}/`);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/notifications/delete/${id}/`);
    return response.data;
  },

  send: async (data: SendNotificationPayload): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>("/notifications/admin/send/", data);
    return response.data;
  },
};
