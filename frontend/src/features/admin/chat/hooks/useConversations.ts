import { useQuery } from "@tanstack/react-query";
import { chatService } from "../api/chat.service";
import { useChatStore } from "../store/chat-store";

export function useConversations() {
  const search = useChatStore((s) => s.search);

  return useQuery({
    queryKey: ["admin", "chat", "conversations", search],
    queryFn: async () => {
      const data = await chatService.getConversations();
      if (search) {
        const lowerSearch = search.toLowerCase();
        return data.filter(
          (c) =>
            c.structure?.nom?.toLowerCase().includes(lowerSearch) ?? false
        );
      }
      return data;
    },
    refetchInterval: 10_000,
  });
}
