"use client";

import { useState, useCallback } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSendMessage } from "../hooks/useSendMessage";

export function MessageInput() {
  const [value, setValue] = useState("");
  const sendMessage = useSendMessage();

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || sendMessage.isPending) return;
    sendMessage.mutate(trimmed);
    setValue("");
  }, [value, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="flex items-center gap-2 border-t px-4 py-3">
      <Input
        placeholder="Écrire un message..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={sendMessage.isPending}
        className="h-9"
      />
      <Button
        size="icon"
        onClick={handleSend}
        disabled={!value.trim() || sendMessage.isPending}
        className="shrink-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
