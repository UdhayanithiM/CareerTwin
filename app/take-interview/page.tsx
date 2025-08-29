"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Clock, Download, Smile, Meh, Frown, Gauge, Bot, MessageSquare } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { useToast } from "@/hooks/use-toast" // FIX: Imported useToast

// --- Helper Components ---

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

const InterviewPanel = () => (
    <Tabs defaultValue="chat" className="h-full flex flex-col">
        <TabsList className="mx-4 mt-4 grid grid-cols-2">
            <TabsTrigger value="chat"><MessageSquare className="mr-2 h-4 w-4" />Chat Interview</TabsTrigger>
            <TabsTrigger value="voice"><Bot className="mr-2 h-4 w-4" />Voice Interview</TabsTrigger>
        </TabsList>
        <TabsContent value="chat" className="flex-1 mt-2">
            <Card className="h-full border-0 rounded-none">
                <CardContent className="p-0 h-full">
                    <iframe 
                        src="https://cdn.botpress.cloud/webchat/v2.4/shareable.html?configUrl=https://files.bpcontent.cloud/2025/05/01/04/20250501042318-OF6QXBDK.json"
                        className="w-full h-full border-0"
                        allow="microphone; clipboard-write"
                        title="Botpress Interview Chat"
                    />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="voice" className="flex-1 mt-2">
            <Card className="h-full border-0 rounded-none">
                 <CardContent className="p-0 h-full">
                    <iframe 
                        src="https://platform.hume.ai/evi/playground?configId=1627a551-5793-4197-b6d0-ade41ef2e0f1"
                        className="w-full h-full border-0"
                        allow="camera; microphone; clipboard-write"
                        title="Hume AI Interview"
                    />
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>
);


// --- Main Page Component ---
export default function TakeInterviewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [timer, setTimer] = useState(0);
  // This state would be driven by real API calls in a full implementation
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
    const interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);
  
  const handleEndInterview = useCallback(() => {
    // Here you would typically call an API to finalize the interview
    toast({ title: "Interview Completed", description: "Redirecting to your report..." });
    router.push('/report');
  }, [router, toast]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
        <InterviewHeader timer={timer} onEndInterview={handleEndInterview} />
        
        <ResizablePanelGroup direction="horizontal" className="flex-1">
            <ResizablePanel defaultSize={70} minSize={50}>
                <InterviewPanel />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={30} minSize={20} className="hidden md:block">
                <AnalysisSidebar analysisData={analysisData} />
            </ResizablePanel>
        </ResizablePanelGroup>
    </div>
  );
}