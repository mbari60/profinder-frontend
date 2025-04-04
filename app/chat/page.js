// "use client";

// import React from "react";
// import ChatContainer from "@/components/chat/ChatContainer";

// export default function ChatPage() {
//   return (
//     <div className="container mx-auto py-8 px-4">
//       <h1 className="text-2xl font-bold mb-6 text-center">
//         Community Support Chat
//       </h1>
//       <ChatContainer />
//     </div>
//   );
// }


"use client";
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const ChatContainer = dynamic(() => import('@/components/chat/ChatContainer'), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-[500px]" />
});

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