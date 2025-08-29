"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { CodeEditor } from "@/components/code-editor"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Video, Mic, MicOff, VideoOff, Monitor, Send, Timer, Code2, PenSquare } from "lucide-react"
import { cn } from "@/lib/utils"

const VideoFeed = ({ name, isVideoOn }: { name: string, isVideoOn: boolean }) => (
    <Card className="aspect-video overflow-hidden">
        <CardContent className="p-0 h-full w-full flex items-center justify-center bg-muted">
            {isVideoOn ? (
                <img 
                    src={`https://via.placeholder.com/400x300/18181b/e2e8f0?text=${name}`}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="text-center text-muted-foreground">
                    <VideoOff className="h-10 w-10 mx-auto mb-2" />
                    <p>{name}'s video is off</p>
                </div>
            )}
        </CardContent>
    </Card>
);

export default function MockInterviewPage() {
    const [code, setCode] = useState(`function findMissingNumber(nums) {\n  // Your implementation here\n}`);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [designSolution, setDesignSolution] = useState("");
    const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes in seconds

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <header className="border-b shrink-0">
                <div className="container h-16 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/assessment-list"><ArrowLeft className="h-4 w-4" /></Link>
                        </Button>
                        <h1 className="text-lg font-semibold">Mock Technical Interview</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant={isVideoOn ? "outline" : "destructive"} size="icon" onClick={() => setIsVideoOn(!isVideoOn)}>
                            {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                        </Button>
                        <Button variant={isAudioOn ? "outline" : "destructive"} size="icon" onClick={() => setIsAudioOn(!isAudioOn)}>
                            {isAudioOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline"><Monitor className="mr-2 h-4 w-4" /> Share</Button>
                        <Button variant="destructive">End Interview</Button>
                    </div>
                </div>
            </header>

            <ResizablePanelGroup direction="horizontal" className="flex-1">
                {/* Left Panel - Video & Info */}
                <ResizablePanel defaultSize={30} minSize={25}>
                    <ScrollArea className="h-full p-4">
                        <div className="space-y-4">
                            <VideoFeed name="Interviewer" isVideoOn={true} />
                            <VideoFeed name="You" isVideoOn={isVideoOn} />
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Timer className="text-primary"/> Current Task</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-center mb-2">{formatTime(timeLeft)}</div>
                                    <p className="text-sm text-muted-foreground">
                                        Complete both the coding and system design tasks. Remember to explain your thought process out loud.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </ScrollArea>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Right Panel - Challenge Area */}
                <ResizablePanel defaultSize={70} minSize={40}>
                    <Tabs defaultValue="coding" className="h-full flex flex-col">
                        <TabsList className="mx-4 mt-4">
                            <TabsTrigger value="coding"><Code2 className="mr-2 h-4 w-4" /> Coding Challenge</TabsTrigger>
                            <TabsTrigger value="design"><PenSquare className="mr-2 h-4 w-4" /> System Design</TabsTrigger>
                        </TabsList>

                        <TabsContent value="coding" className="flex-1 flex flex-col mt-2">
                            <div className="px-4 py-2 border-b">
                                <h2 className="font-semibold">Find the Missing Number</h2>
                                <p className="text-sm text-muted-foreground">
                                    Given an array of n distinct numbers from 0 to n, find the missing one.
                                </p>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <CodeEditor value={code} onChange={setCode} language="javascript" />
                            </div>
                            <div className="p-4 flex justify-end border-t bg-background">
                                <Button>Run Code</Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="design" className="flex-1 flex flex-col mt-2">
                            <div className="px-4 py-2 border-b">
                                <h2 className="font-semibold">Design a URL Shortening Service</h2>
                                <p className="text-sm text-muted-foreground">
                                    Explain the architecture, database design, and scalability of a service like TinyURL.
                                </p>
                            </div>
                            <div className="flex-1 p-4">
                                <Textarea 
                                    placeholder="Type your system design solution here..."
                                    className="w-full h-full resize-none"
                                    value={designSolution}
                                    onChange={(e) => setDesignSolution(e.target.value)}
                                />
                            </div>
                             <div className="p-4 flex justify-end border-t bg-background">
                                <Button><Send className="mr-2 h-4 w-4" /> Submit</Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}