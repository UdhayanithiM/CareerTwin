// File: components/interview/ChatMessage.tsx
"use client";

import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  // FIX: Changed 'sender' to 'role' to match the standard message format.
  role: "user" | "assistant";
  // FIX: Changed 'text' to 'content' to match the standard message format.
  content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex items-start gap-3 my-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="h-5 w-5 text-primary" />
        </div>
      )}

      <div
        className={cn(
          "p-3 rounded-lg max-w-sm md:max-w-md lg:max-w-lg",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>

      {isUser && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};