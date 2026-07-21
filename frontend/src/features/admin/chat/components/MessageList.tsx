"use client";

import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageBubble } from "./MessageBubble";
import { useMessages } from "../hooks/useMessages";
import type { ChatMessage } from "../types/chat";

function MessageSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
        >
          <Skeleton className="h-14 w-48 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

function groupByDate(
  messages: ChatMessage[]
): Map<string, ChatMessage[]> {
  const grouped = new Map<string, ChatMessage[]>();
  for (const msg of messages) {
    const dateKey = format(new Date(msg.created_at), "dd MMMM yyyy", {
      locale: fr,
    });
    const existing = grouped.get(dateKey) ?? [];
    existing.push(msg);
    grouped.set(dateKey, existing);
  }
  return grouped;
}

export function MessageList() {
  const { data, isLoading } = useMessages();
  const bottomRef = useRef<HTMLDivElement>(null);
  const messages = data?.results ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (isLoading) {
    return (
      <ScrollArea className="flex-1">
        <MessageSkeleton />
      </ScrollArea>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Aucun message. Commencez la conversation !
        </p>
      </div>
    );
  }

  const grouped = groupByDate(messages);

  return (
    <ScrollArea className="flex-1">
      <div className="flex flex-col gap-4 px-4 py-4">
        {Array.from(grouped.entries()).map(([dateLabel, msgs]) => (
          <div key={dateLabel} className="flex flex-col gap-3">
            <div className="flex items-center justify-center">
              <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                {dateLabel}
              </span>
            </div>
            {msgs.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
