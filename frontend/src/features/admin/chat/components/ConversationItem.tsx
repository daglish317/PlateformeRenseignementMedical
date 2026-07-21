"use client";

import { Hospital, Pill } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ChatConversation } from "../types/chat";

interface ConversationItemProps {
  conversation: ChatConversation;
  isSelected: boolean;
  onClick: () => void;
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max) + "…";
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) {
    return date.toLocaleDateString("fr-FR", { weekday: "short" });
  }
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

export function ConversationItem({
  conversation,
  isSelected,
  onClick,
}: ConversationItemProps) {
  const { structure, last_message, unread_count } = conversation;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-accent/50",
        isSelected && "bg-accent"
      )}
    >
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={structure.photo ?? undefined} alt={structure.nom} />
        <AvatarFallback>
          {structure.type === "HOPITAL" ? (
            <Hospital className="h-4 w-4" />
          ) : (
            <Pill className="h-4 w-4" />
          )}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium">{structure.nom}</span>
          {last_message && (
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatTime(last_message.created_at)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          {last_message ? (
            <span className="truncate text-xs text-muted-foreground">
              {truncate(last_message.content, 45)}
            </span>
          ) : (
            <span className="text-xs italic text-muted-foreground">
              Aucun message
            </span>
          )}
          {unread_count > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
              {unread_count > 99 ? "99+" : unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
