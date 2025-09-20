// File: app/take-interview/[assessmentId]/page.tsx
'use client';

import React, { useState } from 'react';
import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
import { ChatInput, ChatMessage } from '@/components/interview';
import { LoaderCircle, Mic, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

// This is the upgraded component. It's cleaner and uses the Vercel AI SDK.
export default function InterviewCoachPage({ params }: { params: { assessmentId: string } }) {
  const [interviewStarted, setInterviewStarted] = useState(false);

  // This is the crucial connection. The URL slug (e.g., "Product-Manager") is decoded
  // and used as the context for the interview. This makes the session dynamic and tailored.
  const interviewContext = decodeURIComponent(params.assessmentId).replace(/-/g, ' ');

  // The useChat hook from the Vercel AI SDK handles all chat state, API calls, and streaming.
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    // It points to the upgraded Gemini API route.
    api: '/api/interview/chat',
    // It sends the dynamic interviewContext in the body of every request.
    body: { interviewContext },
    // A simple initial message to kickstart the conversation from the AI.
    initialMessages: [
      {
        id: '1',
        role: 'assistant',
        content: `Hello! I'm Kai, your AI Interview Coach from CareerTwin. Today, we'll be running through a practice interview for a **${interviewContext}** role. I'll ask you a series of questions to help you prepare. Let's begin with the first one: Can you tell me about yourself and what sparked your interest in this field?`
      }
    ]
  });

  const startInterview = () => {
    // This implements the "Focus Mode" by requesting browser fullscreen.
    document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
    });
    setInterviewStarted(true);
  };

  // This is the pre-interview screen.
  if (!interviewStarted) {
    return (
      <MainLayout>
        <div className="container flex flex-col items-center justify-center min-h-[70vh] text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="max-w-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">CareerTwin AI Interview Coach</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">You are about to enter a distraction-free practice session.</p>
                <p className="font-semibold"><strong>Preparing interview for:</strong> {interviewContext}</p>
                <Button size="lg" onClick={startInterview}>Enter Focus Mode & Start</Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  // This is the main, full-screen interview UI.
  return (
    <div className="flex flex-col h-screen bg-muted/40 p-4">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          // Your existing ChatMessage component is used here.
          <ChatMessage key={m.id} role={m.role as 'user' | 'assistant'} content={m.content} />
        ))}
        {isLoading && messages[messages.length -1]?.role === 'user' && (
            <div className="flex items-start gap-4 animate-in fade-in">
                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-lg border bg-background p-4 space-x-2">
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                </div>
            </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-4 border-t pt-4">
        {/* Your existing ChatInput component is used here. */}
        <ChatInput
          value={input}
          onChange={handleInputChange}
          placeholder="Type your answer..."
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>Send</Button>
      </form>
    </div>
  );
}