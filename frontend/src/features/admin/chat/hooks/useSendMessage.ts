import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { chatService } from "../api/chat.service";
import { useChatStore } from "../store/chat-store";

export function useSendMessage() {
  const queryClient = useQueryClient();
  const selectedConversation = useChatStore((s) => s.selectedConversation);

  return useMutation({
    mutationFn: (content: string) => {
      if (!selectedConversation) throw new Error("No conversation selected");
      return chatService.sendMessage(selectedConversation.id, content);
    },
    onMutate: async (content) => {
      if (!selectedConversation) return;

      await queryClient.cancelQueries({
        queryKey: ["admin", "chat", "messages", selectedConversation.structure.id],
      });

      const previous = queryClient.getQueryData([
        "admin",
        "chat",
        "messages",
        selectedConversation.structure.id,
      ]);

      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        content,
        created_at: new Date().toISOString(),
        expediteur: { id: "admin", nom: "Admin", role: "ADMINISTRATEUR" },
        is_read: false,
      };

      queryClient.setQueryData(
        ["admin", "chat", "messages", selectedConversation.structure.id],
        (old: { results: unknown[] } | undefined) => {
          if (!old) return { results: [optimisticMessage], page: 1, page_size: 100, total: 1 };
          return { ...old, results: [...old.results, optimisticMessage] };
        }
      );

      return { previous, structureId: selectedConversation.structure.id };
    },
    onError: (_err, _content, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["admin", "chat", "messages", context.structureId],
          context.previous
        );
      }
      toast.error("Erreur lors de l'envoi du message");
    },
    onSettled: (_data, _error, _content, context) => {
      if (context?.structureId) {
        queryClient.invalidateQueries({
          queryKey: ["admin", "chat", "messages", context.structureId],
        });
        queryClient.invalidateQueries({
          queryKey: ["admin", "chat", "conversations"],
        });
      }
    },
  });
}
