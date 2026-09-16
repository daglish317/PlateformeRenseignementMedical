import { useQuery } from "@tanstack/react-query";
import { chatService } from "../api/chat.service";
import { useChatStore } from "../store/chat-store";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useActiveStructureStore } from "@/features/shared/owner-structures/store/active-structure-store";

export function useConversations() {
  const search = useChatStore((s) => s.search);
  const user = useAuthStore((s) => s.user);
  const activeStructureId = useActiveStructureStore(
    (s) => s.activeStructureId
  );
  const isOwner = user?.role === "PROPRIETAIRE";

  return useQuery({
    queryKey: [
      "admin",
      "chat",
      "conversations",
      search,
      isOwner ? activeStructureId ?? "none" : "all",
    ],
    queryFn: async () => {
      const data = await chatService.getConversations();
      const filtered = isOwner && activeStructureId
        ? data.filter((c) => c.structure?.id === activeStructureId)
        : data;

      if (search) {
        const lowerSearch = search.toLowerCase();
        return filtered.filter(
          (c) =>
            c.structure?.nom?.toLowerCase().includes(lowerSearch) ?? false
        );
      }
      return filtered;
    },
    refetchInterval: 10_000,
  });
}
