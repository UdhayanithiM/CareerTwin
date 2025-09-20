'use client';

import React, { useState, FormEvent, ChangeEvent } from 'react';
// --- THIS IS THE FIX ---
// We define our own simple, reliable type and do not import from 'ai'.
type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
import { ChatInput } from '../../../components/interview/ChatInput';
// Renaming the imported component to avoid a name clash with our type.
import { ChatMessage as ChatMessageComponent } from '../../../components/interview/ChatMessage';
import { LoaderCircle, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InterviewCoachPage({ params }: { params: { assessmentId: string } }) {
  const [interviewStarted, setInterviewStarted] = useState(false);
  const interviewContext = decodeURIComponent(params.assessmentId).replace(/-/g, ' ');

  // This state uses our simple, reliable custom type.
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'initial-message',
      role: 'assistant',
      content: `Hello! I'm Kai, your AI Interview Coach from CareerTwin. Today, we'll be running through a practice interview for a **${interviewContext}** role. Let's begin with the first question: Can you tell me about yourself and what sparked your interest in this field?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // This function uses the browser's native fetch API and is not dependent on any broken hooks.
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/interview/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage], data: { interviewContext } }),
      });

      if (!response.body) throw new Error('Response body is empty.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = '';
      const assistantMessageId = `assistant-${Date.now()}`;

      setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantResponse += decoder.decode(value, { stream: true });
        setMessages(prev => prev.map(msg =>
          msg.id === assistantMessageId ? { ...msg, content: assistantResponse } : msg
        ));
      }
    } catch (error) {
      console.error('Error fetching chat response:', error);
      setMessages(prev => [...prev, { id: 'error-message', role: 'assistant', content: 'Sorry, an error occurred.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startInterview = () => {
    document.documentElement.requestFullscreen().catch((err) => {
      console.error(`Error attempting to enable full-screen mode: ${err.message}`);
    });
    setInterviewStarted(true);
  };

  if (!interviewStarted) {
    return (
      <MainLayout>
        <div className="container flex flex-col items-center justify-center min-h-[70vh] text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="max-w-2xl shadow-lg">
              <CardHeader><CardTitle className="text-2xl">CareerTwin AI Interview Coach</CardTitle></CardHeader>
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

  return (
    <div className="flex flex-col h-screen bg-muted/40 p-4">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <ChatMessageComponent
            key={m.id}
            role={m.role}
            content={m.content}
          />
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex items-start gap-4 animate-in fade-in">
            <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow bg-primary text-primary-foreground"><Bot className="h-4 w-4" /></div>
            <div className="rounded-lg border bg-background p-4 space-x-2"><LoaderCircle className="h-5 w-5 animate-spin" /></div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-4 border-t pt-4">
        <ChatInput
          value={input}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
          placeholder="Type your answer..."
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>Send</Button>
      </form>
    </div>
  );
}