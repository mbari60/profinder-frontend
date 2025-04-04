// "use client"

// import React, { useRef, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { useChat } from "@/hooks/useChat";
// import ChatMessage from "./ChatMessage";
// import ChatInput from "./ChatInput";

// const ChatContainer = () => {
//   const { messages, loading, error, deviceId, sendMessage } = useChat();
//   const scrollAreaRef = useRef(null);

//   // Scroll to bottom when messages change
//   useEffect(() => {
//     if (scrollAreaRef.current) {
//       const scrollContainer = scrollAreaRef.current.querySelector(
//         "[data-radix-scroll-area-viewport]"
//       );
//       if (scrollContainer) {
//         scrollContainer.scrollTop = scrollContainer.scrollHeight;
//       }
//     }
//   }, [messages]);

//   return (
//     <Card className="w-full max-w-md mx-auto h-[500px] flex flex-col">
//       <CardHeader className="px-4 py-2 border-b">
//         <CardTitle className="text-lg">Community Chat</CardTitle>
//       </CardHeader>
//       <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
//         {loading && messages.length === 0 ? (
//           <div className="flex items-center justify-center h-full text-gray-500">
//             Loading messages...
//           </div>
//         ) : error ? (
//           <div className="flex items-center justify-center h-full text-red-500">
//             {error}
//           </div>
//         ) : messages.length === 0 ? (
//           <div className="flex items-center justify-center h-full text-gray-500">
//             No messages yet. Start the conversation!
//           </div>
//         ) : (
//           messages.map((msg) => (
//             <ChatMessage
//               key={msg.id}
//               message={msg}
//               isCurrentUser={msg.device_id === deviceId}
//             />
//           ))
//         )}
//       </ScrollArea>
//       <ChatInput onSendMessage={sendMessage} disabled={loading || !deviceId} />
//     </Card>
//   );
// };

// export default ChatContainer;


"use client";
import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/hooks/useChat";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

const ChatContainer = () => {
  const { messages, loading, error, deviceId, sendMessage } = useChat();
  const scrollAreaRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current && isClient) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isClient]);

  if (!isClient) return null;

  return (
    <Card className="w-full max-w-md mx-auto h-[500px] flex flex-col">
      <CardHeader className="px-4 py-2 border-b">
        <CardTitle className="text-lg">Community Chat</CardTitle>
      </CardHeader>
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Loading messages...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-500">
            {error}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isCurrentUser={msg.device_id === deviceId}
            />
          ))
        )}
      </ScrollArea>
      <ChatInput onSendMessage={sendMessage} disabled={loading || !deviceId} />
    </Card>
  );
};

export default ChatContainer;
