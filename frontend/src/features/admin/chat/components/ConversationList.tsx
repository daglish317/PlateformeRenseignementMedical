"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConversationItem } from "./ConversationItem";
import { useConversations } from "../hooks/useConversations";
import { useChatStore } from "../store/chat-store";
import type { ChatConversation } from "../types/chat";

function ConversationSkeleton() {
  return (
    <div className="flex flex-col gap-1 p-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 rounded-lg px-3 py-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ConversationList() {
  const search = useChatStore((s) => s.search);
  const setSearch = useChatStore((s) => s.setSearch);
  const selectedConversation = useChatStore((s) => s.selectedConversation);
  const setSelectedConversation = useChatStore((s) => s.setSelectedConversation);
  const { data, isLoading } = useConversations();

  const conversations = data ?? [];

  return (
    <div className="flex h-full flex-col border-r">
      <div className="border-b px-3 py-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <ConversationSkeleton />
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <p className="text-sm text-muted-foreground">Aucune conversation</p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5 p-2">
            {conversations.map((conv: ChatConversation) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isSelected={
                  selectedConversation?.id === conv.id
                }
                onClick={() => setSelectedConversation(conv)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
