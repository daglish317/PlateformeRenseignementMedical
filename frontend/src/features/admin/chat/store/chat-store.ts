import { create } from "zustand";
import type { ChatConversation } from "../types/chat";

interface ChatState {
  selectedConversation: ChatConversation | null;
  setSelectedConversation: (conversation: ChatConversation | null) => void;
  search: string;
  setSearch: (search: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  selectedConversation: null,
  setSelectedConversation: (conversation) =>
    set({ selectedConversation: conversation }),
  search: "",
  setSearch: (search) => set({ search }),
}));
