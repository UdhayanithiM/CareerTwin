// app/take-interview/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { ArrowRight, Briefcase } from "lucide-react";
import { toast } from "sonner";

// --- MAIN PAGE COMPONENT ---
export default function TakeInterviewLobbyPage() {
    const [jobTitle, setJobTitle] = useState("Software Engineer");
    const router = useRouter();

    const handleStartInterview = () => {
        if (!jobTitle.trim()) {
            toast.error("Please enter a job title to start the interview.");
            return;
        }
        // Encode the job title to make it URL-safe and navigate to the actual interview page
        const assessmentId = encodeURIComponent(jobTitle.trim().replace(/\s+/g, '-'));
        router.push(`/take-interview/${assessmentId}`);
    };

    return (
        <AuthGuard>
            <MainLayout>
                <div className="container flex items-center justify-center min-h-[70vh]">
                    <Card className="w-full max-w-lg shadow-lg">
                        <CardHeader className="text-center">
                            <CardTitle className="text-3xl">AI Mock Interview</CardTitle>
                            <CardDescription>
                                Prepare for your next interview by practicing with our AI coach.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="job-title" className="text-md font-semibold">
                                    What role are you practicing for?
                                </Label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="job-title"
                                        value={jobTitle}
                                        onChange={(e) => setJobTitle(e.target.value)}
                                        placeholder="e.g., Product Manager, Data Scientist"
                                        className="pl-10 text-lg h-12"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-center text-muted-foreground pt-2">
                                The AI will tailor its questions based on the role you provide.
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button
                                size="lg"
                                className="w-full"
                                onClick={handleStartInterview}
                                disabled={!jobTitle.trim()}
                            >
                                Start My Interview <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </MainLayout>
        </AuthGuard>
    );
}