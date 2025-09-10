// in app/take-interview/[assessmentId]/page.tsx

'use client';

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Clock, Download, Smile, Meh, Frown, Gauge, CircleDashed, LoaderCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { io, type Socket } from "socket.io-client"
import { ChatWindow } from "@/components/interview/ChatWindow"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// --- HELPER COMPONENTS ---
const InterviewHeader = ({ timer, onEndInterview, isEnding }: { timer: number, onEndInterview: () => void, isEnding: boolean }) => {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };
    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <Gauge className="h-6 w-6 text-primary" />
                        <span className="font-bold text-lg"><span className="text-primary">Forti</span>Twin</span>
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(timer)}</span>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isEnding}>
                                {isEnding ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin"/> : null}
                                End Interview
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to end the interview?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action is final. Your interview will be submitted for analysis.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={onEndInterview}>Confirm & End</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </header>
    );
};

const AnalysisSidebar = ({ analysisData }: { analysisData: any }) => {
    // This is a placeholder and can be built out later
    return <div className="p-4"><p className="text-muted-foreground">Real-time analysis sidebar.</p></div>
};

// --- MAIN PAGE COMPONENT ---
export default function TakeInterviewPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const assessmentId = typeof params.assessmentId === 'string' ? params.assessmentId : null;

    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isEnding, setIsEnding] = useState(false);
    const [timer, setTimer] = useState(0);
    const [analysisData, setAnalysisData] = useState({});

    useEffect(() => {
        if (!assessmentId) return;
        const newSocket = io({ path: "/api/socketio", withCredentials: true });
        setSocket(newSocket);
        newSocket.on("connect", () => {
            console.log("Socket connected:", newSocket.id);
            setIsConnected(true);
            newSocket.emit("joinInterview", assessmentId);
        });
        newSocket.on("connect_error", (err) => {
            toast({ variant: "destructive", title: "Connection Failed", description: err.message });
        });
        newSocket.on("disconnect", () => setIsConnected(false));
        const timerInterval = setInterval(() => setTimer((prev) => prev + 1), 1000);
        return () => {
            newSocket.disconnect();
            clearInterval(timerInterval);
        };
    }, [assessmentId, toast]);

    const handleEndInterview = useCallback(() => {
        if (!socket || !assessmentId) return;
        setIsEnding(true);
        toast({ title: "Finishing Up...", description: "Analyzing your interview. Please wait." });
        socket.emit("endInterview", assessmentId, (response: { reportId?: string; error?: string }) => {
            if (response.error) {
                toast({ title: "Error", description: response.error, variant: "destructive" });
                setIsEnding(false);
            } else {
                toast({
                    title: "Interview Completed!",
                    description: "Your report has been generated. Redirecting...",
                    className: "bg-green-100 dark:bg-green-900",
                });
                setTimeout(() => {
                    router.push('/dashboard');
                    router.refresh();
                }, 2000);
            }
        });
    }, [socket, assessmentId, router, toast]);

    if (!assessmentId) {
        return <p>Invalid assessment ID.</p>
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <InterviewHeader timer={timer} onEndInterview={handleEndInterview} isEnding={isEnding} />
            <ResizablePanelGroup direction="horizontal" className="flex-1">
                <ResizablePanel defaultSize={70} minSize={50}>
                    {isConnected ? (
                        <ChatWindow socket={socket} interviewId={assessmentId} />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <div className="text-center">
                                <CircleDashed className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                                <p className="mt-4 text-muted-foreground">Connecting...</p>
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