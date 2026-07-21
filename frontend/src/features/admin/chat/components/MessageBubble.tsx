"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store/auth-store";
import type { ChatMessage } from "../types/chat";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const user = useAuthStore((s) => s.user);
  const isAdmin = message.expediteur.id === user?.id;

  return (
    <div className={cn("flex w-full", isAdmin ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-xl px-3.5 py-2.5 text-sm",
          isAdmin
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {!isAdmin && (
          <p className="mb-1 text-xs font-medium opacity-70">
            {message.expediteur.nom}
          </p>
        )}
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <p
          className={cn(
            "mt-1 text-[10px]",
            isAdmin ? "text-primary-foreground/60" : "text-muted-foreground"
          )}
        >
          {format(new Date(message.created_at), "HH:mm", { locale: fr })}
        </p>
      </div>
    </div>
  );
}
