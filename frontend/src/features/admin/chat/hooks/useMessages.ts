import { useQuery } from "@tanstack/react-query";
import { chatService } from "../api/chat.service";
import { useChatStore } from "../store/chat-store";

export function useMessages() {
  const selectedConversation = useChatStore((s) => s.selectedConversation);

  return useQuery({
    queryKey: [
      "admin",
      "chat",
      "messages",
      selectedConversation?.structure.id,
    ],
    queryFn: () =>
      chatService.getMessages(selectedConversation!.structure.id, {
        page_size: 100,
      }),
    enabled: !!selectedConversation,
    refetchInterval: 5_000,
  });
}
