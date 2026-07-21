import { useQuery } from "@tanstack/react-query";
import { chatService } from "../api/chat.service";

export function useUnreadCount() {
  return useQuery({
    queryKey: ["admin", "chat", "unread-count"],
    queryFn: () => chatService.getUnreadCount(),
    refetchInterval: 10_000,
  });
}
