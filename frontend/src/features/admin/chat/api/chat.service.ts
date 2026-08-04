import api from "@/lib/axios";
import type { ChatConversation, ChatMessage } from "../types/chat";

export interface MessagesResponse {
  results: ChatMessage[];
  page: number;
  page_size: number;
  total: number;
}

export const chatService = {
  getConversations: async (): Promise<ChatConversation[]> => {
    const response = await api.get("/messagerie/conversations/");
    return response.data;
  },

  getMessages: async (
    structureId: string,
    params: Record<string, string | number> = {}
  ): Promise<MessagesResponse> => {
    const response = await api.get(`/messagerie/conversation/${structureId}/`, {
      params,
    });
    return response.data;
  },

  sendMessage: async (
    conversationId: string,
    content: string
  ): Promise<ChatMessage> => {
    const response = await api.post(`/messagerie/send/${conversationId}/`, {
      contenu: content,
    });
    return response.data;
  },

  markAsRead: async (messageId: string): Promise<void> => {
    await api.patch(`/messagerie/read/${messageId}/`);
  },

  getUnreadCount: async (): Promise<{ total_non_lus: number }> => {
    const response = await api.get("/messagerie/unread-count/");
    return response.data;
  },
};
