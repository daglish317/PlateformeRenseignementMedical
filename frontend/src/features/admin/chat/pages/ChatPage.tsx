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

      <div className="flex h-[calc(100vh-220px)] overflow-hidden rounded-lg border bg-background">
        {/* Left panel - Conversations */}
        <div
          className={`w-full shrink-0 md:w-[320px] ${
            mobileShowChat && selectedConversation ? "hidden md:flex" : "flex"
          } flex-col`}
        >
          <div
            className="flex-1"
            onClick={() => {
              if (!selectedConversation) return;
              handleSelect();
            }}
          >
            <ConversationList />
          </div>
        </div>

        {/* Right panel - Messages */}
        <div
          className={`flex flex-1 flex-col ${
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
