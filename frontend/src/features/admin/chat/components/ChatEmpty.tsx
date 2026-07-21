"use client";

import { MessageSquare } from "lucide-react";

export function ChatEmpty() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <MessageSquare className="h-12 w-12 text-muted-foreground/40" />
      <h3 className="text-lg font-medium text-muted-foreground">
        Messagerie
      </h3>
      <p className="max-w-xs text-sm text-muted-foreground/70">
        Sélectionnez une conversation pour commencer à échanger avec une structure.
      </p>
    </div>
  );
}
