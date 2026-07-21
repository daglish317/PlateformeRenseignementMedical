import api from "@/lib/axios";
import type { ChatConversation, ChatMessage } from "../types/chat";

interface ConversationsResponse {
  results: ChatConversation[];
  page: number;
  page_size: number;
  total: number;
}

interface MessagesResponse {
  results: ChatMessage[];
  page: number;
  page_size: number;
  total: number;
}

export const chatService = {
  getConversations: async (
    params: Record<string, string | number> = {}
  ): Promise<ConversationsResponse> => {
    const response = await api.get("/messagerie/conversations/", { params });
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
      content,
    });
    return response.data;
  },

  markAsRead: async (messageId: string): Promise<void> => {
    await api.post(`/messagerie/read/${messageId}/`);
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await api.get("/messagerie/unread-count/");
    return response.data;
  },
};
