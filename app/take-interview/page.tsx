"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Clock, Download, Smile, Meh, Frown, Gauge, Bot, MessageSquare, Send, User, CornerDownLeft, CircleDashed } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { useToast } from "@/components/ui/use-toast"
import { io, Socket } from "socket.io-client"
import { cn } from "@/lib/utils"

// --- TYPE DEFINITIONS ---
interface Message {
  sender: "user" | "ai";
  text: string;
}

// --- HELPER COMPONENTS (NO CHANGES) ---
const InterviewHeader = ({ timer, onEndInterview }: { timer: number, onEndInterview: () => void }) => {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };
    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        <Gauge className="h-6 w-6 text-primary" />
                        <span className="font-bold text-lg"><span className="text-primary">Forti</span>Twin</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(timer)}</span>
                    </div>
                    <ModeToggle />
                    <Button variant="destructive" onClick={onEndInterview}>End Interview</Button>
                </div>
            </div>
        </header>
    );
};

const AnalysisSidebar = ({ analysisData }: { analysisData: any }) => {
    const getSentimentIcon = () => {
        if (analysisData.sentiment.name === "positive") return <Smile className="h-5 w-5 text-green-500" />;
        if (analysisData.sentiment.name === "negative") return <Frown className="h-5 w-5 text-red-500" />;
        return <Meh className="h-5 w-5 text-muted-foreground" />;
    };
    return (
        <ScrollArea className="h-full p-4">
            <div className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>Real-time Analysis</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium mb-2 flex items-center">Sentiment {getSentimentIcon()}</h3>
                            <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md">{analysisData.sentiment.text}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium mb-3">Interview Progress</h3>
                            <Progress value={analysisData.progress} />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Technical Skills</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {analysisData.skills.map((skill: any) => (
                            <div key={skill.name}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-muted-foreground">{skill.name}</span>
                                    <span>{skill.value}%</span>
                                </div>
                                <Progress value={skill.value} />
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Interview Tips</CardTitle></CardHeader>
                    <CardContent><p className="text-sm text-muted-foreground">{analysisData.tip}</p></CardContent>
                </Card>
                <Button variant="outline" className="w-full" asChild>
                    <Link href="/report"><Download className="mr-2 h-4 w-4"/> View Full Report</Link>
                </Button>
            </div>
        </ScrollArea>
    );
};


const ChatMessage = ({ message }: { message: Message }) => {
    const isUser = message.sender === "user";
    return (
        <div className={cn("flex items-start gap-3", isUser && "justify-end")}>
            {!isUser && (
                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground">
                    <Bot className="h-5 w-5" />
                </div>
            )}
            <div className={cn("max-w-xs rounded-lg p-3 text-sm", isUser ? "bg-primary text-primary-foreground" : "bg-muted")}>
                {message.text}
            </div>
            {isUser && (
                 <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-muted">
                    <User className="h-5 w-5" />
                </div>
            )}
        </div>
    );
};

const ChatInput = ({ onSendMessage, isSending }: { onSendMessage: (text: string) => void, isSending: boolean }) => {
    const [text, setText] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onSendMessage(text.trim());
            setText("");
        }
    };
    
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [text]);

    return (
        <div className="p-4 bg-background border-t">
            <form onSubmit={handleSubmit} className="relative">
                <Textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                    placeholder="Type your message..."
                    className="w-full pr-20 resize-none max-h-32"
                    rows={1}
                    disabled={isSending}
                />
                <Button type="submit" size="icon" className="absolute right-3 top-1/2 -translate-y-1/2" disabled={isSending || !text.trim()}>
                    {isSending ? <CircleDashed className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </form>
        </div>
    );
};

// ====================================================================
// UPDATED ChatPanel Component
// ====================================================================
const ChatPanel = ({ socket, interviewId }: { socket: Socket | null, interviewId: string | null }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isSending, setIsSending] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (!socket) return;
        
        // Listen for the full chat history on joining/rejoining
        const handleChatHistory = (history: Message[]) => {
            setMessages(history);
        };
        
        // Listen for new incoming AI responses
        const handleAiResponse = (message: Message) => {
            setMessages((prev) => [...prev, message]);
            setIsSending(false);
        };

        socket.on("chatHistory", handleChatHistory);
        socket.on("aiResponse", handleAiResponse);

        // Clean up listeners when the component unmounts or socket changes
        return () => {
            socket.off("chatHistory", handleChatHistory);
            socket.off("aiResponse", handleAiResponse);
        };
    }, [socket]);

    const handleSendMessage = useCallback((text: string) => {
        if (socket && interviewId) {
            const userMessage: Message = { sender: "user", text };
            // Optimistically update the UI with the user's message
            setMessages((prev) => [...prev, userMessage]);
            setIsSending(true);
            socket.emit("sendMessage", userMessage, interviewId);
        }
    }, [socket, interviewId]);
    
    return (
        <div className="h-full flex flex-col">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <ChatMessage key={index} message={msg} />
                    ))}
                    {isSending && (
                         <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground">
                                <Bot className="h-5 w-5" />
                            </div>
                            <div className="max-w-xs rounded-lg p-3 text-sm bg-muted">
                                <CircleDashed className="h-5 w-5 animate-spin" />
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
            <ChatInput onSendMessage={handleSendMessage} isSending={isSending}/>
        </div>
    );
};

export default function TakeInterviewPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    
    const interviewId = typeof params.interviewId === 'string' ? params.interviewId : "mock-interview-123";

    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [timer, setTimer] = useState(0);
    const [analysisData] = useState({
        sentiment: { name: "neutral", text: "Your tone is balanced and professional." },
        progress: 10,
        skills: [
            { name: 'Problem Solving', value: 20 },
            { name: 'Algorithm Knowledge', value: 15 },
            { name: 'Code Quality', value: 25 },
        ],
        tip: "Speak clearly and confidently about your experience and skills."
    });

    useEffect(() => {
        const newSocket = io({
            path: "/api/socketio",
            withCredentials: true,
        });

        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("✅ Socket connected!", newSocket.id);
            setIsConnected(true);
            newSocket.emit("joinInterview", interviewId);
        });

        newSocket.on("connect_error", (err) => {
            console.error("❌ Socket connection error:", err.message);
            toast({
                variant: "destructive",
                title: "Connection Failed",
                description: "Could not connect to the interview server. Please try again.",
            });
        });

        newSocket.on("disconnect", () => {
            console.log("🔌 Socket disconnected.");
            setIsConnected(false);
        });
        
        const interval = setInterval(() => setTimer((prev) => prev + 1), 1000);

        return () => {
            console.log("Unmounting... disconnecting socket.");
            newSocket.disconnect();
            clearInterval(interval);
        };
    }, [interviewId, toast]);

    const handleEndInterview = useCallback(() => {
        toast({ title: "Interview Completed", description: "Redirecting to your report..." });
        router.push('/report');
    }, [router, toast]);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <InterviewHeader timer={timer} onEndInterview={handleEndInterview} />
            
            <ResizablePanelGroup direction="horizontal" className="flex-1">
                <ResizablePanel defaultSize={70} minSize={50}>
                    <Tabs defaultValue="chat" className="h-full flex flex-col">
                        <TabsList className="mx-4 mt-4 grid grid-cols-2">
                            <TabsTrigger value="chat"><MessageSquare className="mr-2 h-4 w-4" />Chat Interview</TabsTrigger>
                            <TabsTrigger value="voice" disabled><Bot className="mr-2 h-4 w-4" />Voice (Coming Soon)</TabsTrigger>
                        </TabsList>
                        <TabsContent value="chat" className="flex-1 mt-2">
                            {isConnected ? (
                                <ChatPanel socket={socket} interviewId={interviewId} />
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <div className="text-center">
                                        <CircleDashed className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                                        <p className="mt-4 text-muted-foreground">Connecting to interview server...</p>
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="voice">
                           {/* The Hume AI iframe can remain here for future use */}
                        </TabsContent>
                    </Tabs>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={30} minSize={20} className="hidden md:block">
                    <AnalysisSidebar analysisData={analysisData} />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}