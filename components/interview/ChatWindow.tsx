// components/interview/ChatWindow.tsx
"use strict";

import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { io, Socket } from "socket.io-client";

interface Message {
  sender: "user" | "ai";
  text: string;
}

interface ServerToClientEvents {
  aiResponse: (message: Message) => void;
}

interface ClientToServerEvents {
  sendMessage: (message: Message) => void;
}

// NEW: Define the props for our component, including the callback
interface ChatWindowProps {
    onAnalysisUpdate: (analysis: any) => void;
}

export const ChatWindow = ({ onAnalysisUpdate }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Hello! I am your AI interviewer from FortiTwin. Your session is now connected in real-time. Let's begin. Tell me about yourself.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  useEffect(() => {
    const socket = io();
    socketRef.current = socket;
    socket.on("aiResponse", (message) => {
      setMessages((prev) => [...prev, message]);
      setIsLoading(false);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // NEW: Function to call our analysis API
  const analyzeUserMessage = async (text: string) => {
      try {
          const response = await fetch('/api/interview/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text }),
          });
          const data = await response.json();
          if (data.success) {
              // Call the callback prop to update the parent component's state
              onAnalysisUpdate(data.analysis);
          }
      } catch (error) {
          console.error("Failed to analyze text:", error);
      }
  };

  const handleSendMessage = (userMessage: string) => {
    if (socketRef.current) {
      const message: Message = { sender: "user", text: userMessage };
      setMessages((prev) => [...prev, message]);
      setIsLoading(true);

      socketRef.current.emit("sendMessage", message);

      // MODIFIED: Call the analysis function every time the user sends a message
      analyzeUserMessage(userMessage);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="max-w-4xl mx-auto">
          {messages.map((msg, index) => (
            <ChatMessage key={index} sender={msg.sender} text={msg.text} />
          ))}
          {isLoading && <ChatMessage sender="ai" text="Thinking..." />}
        </div>
      </ScrollArea>
      <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};