"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Clock, Download, Smile, Meh, Frown, Gauge, CircleDashed } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { io, type Socket } from "socket.io-client"
import { ChatWindow } from "@/components/interview/ChatWindow"

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

// --- MAIN PAGE COMPONENT ---
export default function TakeInterviewPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();

    // --- THIS IS THE CORRECTED LOGIC ---
    // We now correctly read the `assessmentId` from the URL.
    const assessmentId = typeof params.assessmentId === 'string' ? params.assessmentId : null;

    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [timer, setTimer] = useState(0);

    // This will be updated later by real AI analysis
    const [analysisData, setAnalysisData] = useState({
        sentiment: { name: "neutral", text: "Awaiting input..." },
        progress: 0,
        skills: [],
        tip: "Remember to be clear and concise in your answers."
    });

    useEffect(() => {
        // Only try to connect if we have a valid assessmentId from the URL
        if (!assessmentId) return;

        const newSocket = io({
            path: "/api/socketio",
            withCredentials: true,
        });

        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("Socket connected:", newSocket.id);
            setIsConnected(true);
            // Join the specific interview room using the assessmentId
            newSocket.emit("joinInterview", assessmentId);
        });

        newSocket.on("connect_error", (err) => {
            console.error("Socket connection error:", err.message);
            toast({
                variant: "destructive",
                title: "Connection Failed",
                description: "Could not connect to the interview server. Please refresh.",
            });
        });

        newSocket.on("disconnect", () => {
            console.log("Socket disconnected.");
            setIsConnected(false);
        });

        const timerInterval = setInterval(() => setTimer((prev) => prev + 1), 1000);

        return () => {
            newSocket.disconnect();
            clearInterval(timerInterval);
        };
    }, [assessmentId, toast]);

    const handleEndInterview = useCallback(() => {
        toast({ title: "Interview Completed", description: "Redirecting to your dashboard..." });
        router.push('/dashboard');
    }, [router, toast]);

    // If there's no assessmentId, it's an invalid link.
    if (!assessmentId) {
        return (
            <div className="flex h-screen w-full items-center justify-center text-center">
                <div>
                    <h2 className="text-xl font-bold text-destructive">Invalid Interview Link</h2>
                    <p className="text-muted-foreground">This link is not valid. Please return to your dashboard.</p>
                    <Button asChild className="mt-4"><Link href="/dashboard">Go to Dashboard</Link></Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <InterviewHeader timer={timer} onEndInterview={handleEndInterview} />

            <ResizablePanelGroup direction="horizontal" className="flex-1">
                <ResizablePanel defaultSize={70} minSize={50}>
                    {isConnected ? (
                        <ChatWindow socket={socket} interviewId={assessmentId} />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <div className="text-center">
                                <CircleDashed className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                                <p className="mt-4 text-muted-foreground">Connecting to interview server...</p>
                            </div>
                        </div>
                    )}
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={30} minSize={20} className="hidden md:block">
                    <AnalysisSidebar analysisData={analysisData} />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}