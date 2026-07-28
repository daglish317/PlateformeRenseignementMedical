import api from "@/lib/axios";
import type {
  AdminNotification,
  SendNotificationPayload,
} from "../types/notification";

export const notificationsService = {
  list: async (params?: Record<string, string | number>): Promise<AdminNotification[]> => {
    const response = await api.get<AdminNotification[]>("/notifications/", { params });
    return response.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.post(`/notifications/read/${id}/`);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/notifications/delete/${id}/`);
  },

  send: async (data: SendNotificationPayload): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>("/notifications/admin/send/", data);
    return response.data;
  },

  unreadCounts: async (): Promise<Record<string, number>> => {
    const response = await api.get<Record<string, number>>("/notifications/unread-counts/");
    return response.data;
  },

  broadcast: async (data: { titre: string; message: string; type?: string; nav_item?: string }): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>("/notifications/admin/broadcast/", data);
    return response.data;
  },

  triggerWeeklyReminder: async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>("/notifications/admin/weekly-reminder/");
    return response.data;
  },

  markAllAsRead: async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>("/notifications/read-all/");
    return response.data;
  },
};
