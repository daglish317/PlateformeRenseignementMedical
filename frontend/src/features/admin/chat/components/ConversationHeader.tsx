"use client";

import { ArrowLeft, Hospital, Pill, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useChatStore } from "../store/chat-store";
import { useAuthStore } from "@/features/auth/store/auth-store";

interface ConversationHeaderProps {
  onBack?: () => void;
  showBack?: boolean;
}

export function ConversationHeader({ onBack, showBack }: ConversationHeaderProps) {
  const selectedConversation = useChatStore((s) => s.selectedConversation);
  const user = useAuthStore((s) => s.user);
  const isStructureMember =
    user?.role === "GESTIONNAIRE" || user?.role === "PROPRIETAIRE";
  if (!selectedConversation) return null;

  const { structure } = selectedConversation;
  const displayName = isStructureMember
    ? "SantéProx Admin"
    : (selectedConversation.structure_nom ?? structure?.nom ?? "Unknown");
  const displayPhoto = isStructureMember
    ? null
    : (selectedConversation.structure_photo ?? structure?.photo ?? null);
  const displayType = isStructureMember
    ? null
    : (selectedConversation.structure_type ?? structure?.type ?? null);

  return (
    <div className="flex items-center gap-3 border-b px-4 py-3">
      {showBack && (
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 md:hidden">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}
      <Avatar className="h-9 w-9">
        <AvatarImage src={displayPhoto ?? undefined} alt={displayName} />
        <AvatarFallback>
          {isStructureMember ? (
            <Shield className="h-4 w-4" />
          ) : displayType === "HOPITAL" ? (
            <Hospital className="h-4 w-4" />
          ) : (
            <Pill className="h-4 w-4" />
          )}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{displayName}</p>
        <p className="text-xs text-muted-foreground">
          {isStructureMember
            ? "Administrateur"
            : displayType === "HOPITAL"
              ? "Hôpital"
              : "Pharmacie"}
        </p>
      </div>
    </div>
  );
}
