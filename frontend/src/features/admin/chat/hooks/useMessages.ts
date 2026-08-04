import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { chatService, type MessagesResponse } from "../api/chat.service";
import { useChatStore } from "../store/chat-store";

export function useMessages() {
  const queryClient = useQueryClient();
  const selectedConversation = useChatStore((s) => s.selectedConversation);

  const query = useQuery<MessagesResponse>({
    queryKey: [
      "admin",
      "chat",
      "messages",
      selectedConversation?.structure?.id ?? selectedConversation?.id,
    ],
    queryFn: () =>
      chatService.getMessages(selectedConversation!.structure?.id ?? selectedConversation!.id, {
        page_size: 100,
      }),
    enabled: !!selectedConversation,
    refetchInterval: 5_000,
  });

  useEffect(() => {
    if (query.data) {
      queryClient.invalidateQueries({ queryKey: ["admin", "chat", "conversations"] });
    }
  }, [query.data, queryClient]);

  return query;
}
