"use client";

import React from "react";
import ChatContainer from "@/components/chat/ChatContainer";

export default function ChatPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Community Support Chat
      </h1>
      <ChatContainer />
    </div>
  );
}
