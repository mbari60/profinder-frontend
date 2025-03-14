import React, { memo } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const ChatMessage = ({ message, isCurrentUser }) => {
  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-md rounded-lg p-3",
          isCurrentUser ? "bg-blue-500 text-white" : "bg-gray-100"
        )}
      >
        <div className="flex items-end">
          <div className="flex flex-col">
            <span className="text-sm font-medium mb-1">
              {isCurrentUser ? "You" : message.device_id}
            </span>
            <span className="text-base">{message.message}</span>
          </div>
        </div>
        <div
          className={cn(
            "text-xs mt-1",
            isCurrentUser ? "text-blue-100" : "text-gray-500"
          )}
        >
          {format(new Date(message.created_at), "HH:mm")}
        </div>
      </div>
    </div>
  );
};

export default memo(ChatMessage);
