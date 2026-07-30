"use client";

import { useState } from "react";
import { AdminPageTitle } from "../../shared/components/AdminPageTitle";
import { ConversationList } from "../components/ConversationList";
import { ConversationHeader } from "../components/ConversationHeader";
import { MessageList } from "../components/MessageList";
import { MessageInput } from "../components/MessageInput";
import { ChatEmpty } from "../components/ChatEmpty";
import { useChatStore } from "../store/chat-store";

export function ChatPage() {
  const selectedConversation = useChatStore((s) => s.selectedConversation);
  const setSelectedConversation = useChatStore((s) => s.setSelectedConversation);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const handleSelect = () => {
    setMobileShowChat(true);
  };

  const handleBack = () => {
    setMobileShowChat(false);
    setSelectedConversation(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageTitle
        title="Messagerie"
        subtitle="Communication en temps réel avec les structures"
      />

      <div className="flex h-[calc(100vh-220px)] rounded-lg border bg-background">
        {/* Left panel - Conversations */}
        <div
          className={`flex w-full shrink-0 flex-col overflow-hidden md:w-[320px] ${
            mobileShowChat && selectedConversation ? "hidden md:flex" : "flex"
          }`}
          onClick={() => {
            if (!selectedConversation) return;
            handleSelect();
          }}
        >
          <ConversationList />
        </div>

        {/* Right panel - Messages */}
        <div
          className={`flex min-h-0 flex-1 flex-col overflow-hidden ${
            !selectedConversation || !mobileShowChat
              ? "hidden md:flex"
              : "flex"
          }`}
        >
          {selectedConversation ? (
            <>
              <ConversationHeader onBack={handleBack} showBack />
              <MessageList />
              <MessageInput />
            </>
          ) : (
            <ChatEmpty />
          )}
        </div>
      </div>
    </div>
  );
}
