// components/interview/ChatWindow.tsx
"use strict";

import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { io, Socket } from "socket.io-client";

// Define the structure of a message
interface Message {
  sender: "user" | "ai";
  text: string;
}

// It's good practice to define the server events
interface ServerToClientEvents {
  aiResponse: (message: Message) => void;
}

interface ClientToServerEvents {
  sendMessage: (message: Message) => void;
}

export const ChatWindow = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Hello! I am your AI interviewer from FortiTwin. Your session is now connected in real-time. Let's begin. Tell me about yourself.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // FIX: Initialize useRef with null and update the type to allow null
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  // Effect for setting up and tearing down the socket connection
  useEffect(() => {
    // Connect to the server
    const socket = io();
    socketRef.current = socket;

    // Listen for incoming AI responses
    socket.on("aiResponse", (message) => {
      setMessages((prev) => [...prev, message]);
      setIsLoading(false);
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  // Effect for auto-scrolling
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSendMessage = (userMessage: string) => {
    // The check for socketRef.current is important here
    if (socketRef.current) {
      const message: Message = { sender: "user", text: userMessage };
      setMessages((prev) => [...prev, message]);
      setIsLoading(true);

      // Send the message to the server via WebSocket
      socketRef.current.emit("sendMessage", message);
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