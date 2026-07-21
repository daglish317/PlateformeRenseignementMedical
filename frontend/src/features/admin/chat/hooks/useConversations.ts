import { useQuery } from "@tanstack/react-query";
import { chatService } from "../api/chat.service";
import { useChatStore } from "../store/chat-store";

export function useConversations() {
  const search = useChatStore((s) => s.search);

  const params: Record<string, string | number> = {
    page_size: 50,
  };

  if (search) params.search = search;

  return useQuery({
    queryKey: ["admin", "chat", "conversations", search],
    queryFn: () => chatService.getConversations(params),
    refetchInterval: 10_000,
  });
}
