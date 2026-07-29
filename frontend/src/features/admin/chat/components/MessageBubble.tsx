"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, CheckCheck } from "lucide-react";
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
        <p className="whitespace-pre-wrap break-words">{message.contenu}</p>
        <div className={cn("mt-1 flex items-center gap-1", isAdmin ? "justify-end" : "justify-start")}>
          <span className="text-[10px] leading-none">
            {format(new Date(message.created_at), "HH:mm", { locale: fr })}
          </span>
          {isAdmin && (
            message.is_read
              ? <CheckCheck className="h-3.5 w-3.5 text-blue-400" />
              : <Check className="h-3.5 w-3.5 text-primary-foreground/60" />
          )}
        </div>
      </div>
    </div>
  );
}
