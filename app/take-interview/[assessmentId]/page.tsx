// app/take-interview/[assessmentId]/page.tsx
'use client';
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
import { ChatInput } from '../../../components/interview/ChatInput';
import { ChatMessage as ChatMessageComponent } from '../../../components/interview/ChatMessage';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoaderCircle, Bot, Smile, Meh, Frown, BrainCircuit, XSquare } from 'lucide-react';
import { motion } from 'framer-motion';
// ✨ --- NEW IMPORTS ---
import { FeedbackSummary } from '@/components/interview/FeedbackSummary';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const AnalysisSidebar = ({ analysisData, isAnalyzing }: { analysisData: any, isAnalyzing: boolean }) => {
    /* ... (The AnalysisSidebar component code remains unchanged) ... */
    const getSentimentIcon = () => {
        if (analysisData.sentiment.score > 0.2) return <Smile className="h-5 w-5 text-green-500" />;
        if (analysisData.sentiment.score < -0.2) return <Frown className="h-5 w-5 text-red-500" />;
        return <Meh className="h-5 w-5 text-muted-foreground" />;
    };
    return (
        <ScrollArea className="h-full p-4 bg-muted/30">
            <div className="space-y-6">
                <Card>
                    <CardHeader><CardTitle className="text-lg">Live Feedback</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {isAnalyzing ? (
                             <div className="flex items-center text-sm text-muted-foreground"><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Analyzing...</div>
                        ) : (
                           <>
                            <div>
                                <h3 className="text-sm font-medium mb-2 flex items-center">Sentiment {getSentimentIcon()}</h3>
                                <p className="text-xs text-muted-foreground bg-muted p-2 rounded-md">
                                    {analysisData.sentiment.score > 0.2 ? "Positive tone detected." :
                                     analysisData.sentiment.score < -0.2 ? "Negative tone detected." : "Neutral tone."}
                                </p>
                            </div>
                             <div>
                                <h3 className="text-sm font-medium mb-2 flex items-center"><BrainCircuit className="mr-2 h-4 w-4" />Keywords Mentioned</h3>
                                {analysisData.keywords.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {analysisData.keywords.map((kw: string, i: number) => <div key={i} className="text-xs bg-primary/10 text-primary border rounded-full px-2 py-1">{kw}</div>)}
                                    </div>
                                ) : <p className="text-xs text-muted-foreground">No specific keywords detected yet.</p>}
                            </div>
                           </>
                        )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="text-lg">Interview Tips</CardTitle></CardHeader>
                    <CardContent><p className="text-sm text-muted-foreground">Use the STAR method (Situation, Task, Action, Result) to structure your answers about past experiences.</p></CardContent>
                </Card>
            </div>
        </ScrollArea>
    );
};

// --- Main Page Component ---
export default function InterviewCoachPage({ params }: { params: { assessmentId: string } }) {
    const [interviewStarted, setInterviewStarted] = useState(false);
    const [isInterviewEnded, setIsInterviewEnded] = useState(false); // ✨ New state
    const interviewContext = decodeURIComponent(params.assessmentId).replace(/-/g, ' ');

    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'initial-message',
            role: 'assistant',
            content: `Hello! I'm Kai, your AI Interview Coach from CareerTwin. Today, we'll be running through a practice interview for a **${interviewContext}** role. Let's begin with the first question: Can you tell me about yourself and what sparked your interest in this field?`
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [analysisData, setAnalysisData] = useState({ sentiment: { score: 0 }, keywords: [] });
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        /* ... (handleSubmit and analyzeLastAnswer functions remain unchanged) ... */
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/interview/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages, data: { interviewContext } }),
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
            await analyzeLastAnswer(userMessage.content);
        }
    };
    
    const analyzeLastAnswer = async (text: string) => {
        setIsAnalyzing(true);
        try {
            const response = await fetch('/api/interview/analyze-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });
            const data = await response.json();
            if (response.ok) {
                setAnalysisData(data);
            }
        } catch (error) {
            console.error("Failed to analyze answer:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };


    const startInterview = () => {
        document.documentElement.requestFullscreen().catch((err) => {
            console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
        setInterviewStarted(true);
    };

    // ✨ New function to handle ending the interview
    const handleEndInterview = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        setIsInterviewEnded(true);
    };

    if (!interviewStarted) {
        /* ... (The pre-interview "Focus Mode" card remains unchanged) ... */
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

    // ✨ New conditional render for the feedback screen
    if (isInterviewEnded) {
        return (
             <MainLayout>
                <FeedbackSummary messages={messages} interviewContext={interviewContext} />
             </MainLayout>
        );
    }
    
    return (
        <div className="h-screen bg-background flex flex-col">
            {/* ✨ New Header with End Interview Button */}
            <header className="flex items-center justify-between p-2 border-b">
                <p className="font-bold text-lg">AI Mock Interview: <span className="text-primary">{interviewContext}</span></p>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive"><XSquare className="mr-2 h-4 w-4"/> End Interview</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to end the interview?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will conclude your practice session and generate your final feedback report.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Continue Interview</AlertDialogCancel>
                            <AlertDialogAction onClick={handleEndInterview}>End & Get Feedback</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </header>
            <ResizablePanelGroup direction="horizontal" className="flex-1">
                <ResizablePanel defaultSize={70} minSize={50}>
                    <div className="flex flex-col h-full p-4">
                        <ScrollArea className="flex-1 pr-4">
                            <div className="space-y-4">
                                {messages.map((m) => (
                                    <ChatMessageComponent key={m.id} role={m.role} content={m.content} />
                                ))}
                            </div>
                        </ScrollArea>
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
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={30} minSize={20} className="hidden md:block">
                    <AnalysisSidebar analysisData={analysisData} isAnalyzing={isAnalyzing}/>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}