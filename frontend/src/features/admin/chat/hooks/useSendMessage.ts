import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { chatService, type MessagesResponse } from "../api/chat.service";
import { useChatStore } from "../store/chat-store";
import { useAuthStore } from "@/features/auth/store/auth-store";

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

      const user = useAuthStore.getState().user;
      const structureId = selectedConversation.structure?.id ?? selectedConversation.id;

      await queryClient.cancelQueries({
        queryKey: ["admin", "chat", "messages", structureId],
      });

      const previous = queryClient.getQueryData([
        "admin",
        "chat",
        "messages",
        structureId,
      ]);

      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        contenu: content,
        created_at: new Date().toISOString(),
        expediteur: { id: user?.id ?? "me", nom: user?.nom ?? "Moi", role: user?.role ?? "GESTIONNAIRE" },
        is_read: false,
      };

      queryClient.setQueryData(
        ["admin", "chat", "messages", structureId],
        (old: MessagesResponse | undefined) => {
          if (!old) {
            return {
              messages: [optimisticMessage],
              total_messages: 1,
              page: 1,
              page_size: 100,
            };
          }
          return {
            ...old,
            messages: [...(old.messages ?? []), optimisticMessage],
            total_messages: (old.total_messages ?? 0) + 1,
          };
        }
      );

      return { previous, structureId };
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
