"use client";

import { ArrowLeft, Hospital, Pill } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useChatStore } from "../store/chat-store";

interface ConversationHeaderProps {
  onBack?: () => void;
  showBack?: boolean;
}

export function ConversationHeader({ onBack, showBack }: ConversationHeaderProps) {
  const selectedConversation = useChatStore((s) => s.selectedConversation);
  if (!selectedConversation) return null;

  const { structure } = selectedConversation;

  return (
    <div className="flex items-center gap-3 border-b px-4 py-3">
      {showBack && (
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 md:hidden">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}
      <Avatar className="h-9 w-9">
        <AvatarImage src={structure.photo ?? undefined} alt={structure.nom} />
        <AvatarFallback>
          {structure.type === "HOPITAL" ? (
            <Hospital className="h-4 w-4" />
          ) : (
            <Pill className="h-4 w-4" />
          )}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{structure.nom}</p>
        <p className="text-xs text-muted-foreground">
          {structure.type === "HOPITAL" ? "Hôpital" : "Pharmacie"}
        </p>
      </div>
    </div>
  );
}
