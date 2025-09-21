// app/roadmap/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // ✨ Import useRouter
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LoaderCircle, Milestone, BookOpen, Link as LinkIcon, ArrowRight } from 'lucide-react';
import { toast } from 'sonner'; // ✨ Import toast
import { AuthGuard } from '@/components/AuthGuard';
import { apiClient } from '@/lib/apiClient'; // ✨ Import the apiClient

// Interfaces remain the same
interface RoadmapStep {
  title: string;
  description: string;
  resourceLink?: string | null;
}

interface RoadmapSection {
  sectionTitle: string;
  steps: RoadmapStep[];
}

function RoadmapContent() {
    const searchParams = useSearchParams();
    const router = useRouter(); // ✨ Initialize router
    const [roadmap, setRoadmap] = useState<RoadmapSection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const careerTitle = searchParams.get('career');
    const strengths = searchParams.get('strengths');
    const gaps = searchParams.get('gaps');

    useEffect(() => {
        const fetchRoadmap = async () => {
            if (careerTitle && strengths && gaps) {
                try {
                    // ✨ USE THE API CLIENT FOR A ROBUST, AUTHENTICATED REQUEST
                    const data = await apiClient.post('/api/roadmap', {
                        careerTitle,
                        strengths: strengths.split(','),
                        gaps: gaps.split(',')
                    });
                    setRoadmap(data.roadmap);
                } catch (err: any) {
                    // ✨ Use toast for user-friendly error feedback
                    toast.error("Failed to generate roadmap", {
                        description: err.message,
                    });
                    if (err.message.toLowerCase().includes("authenticated")) {
                        router.push('/login');
                    }
                } finally {
                    setIsLoading(false);
                }
            } else {
                toast.error("Career information is missing", {
                    description: "Please select a career path first.",
                });
                setIsLoading(false);
                router.push('/career-paths');
            }
        };
        fetchRoadmap();
    }, [careerTitle, strengths, gaps, router]);

    if (isLoading) {
        return (
            <div className="text-center">
                <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Our AI Strategist is crafting your personalized roadmap...</p>
            </div>
        );
    }

    // ✨ The old error text is no longer needed

    return (
        <div className="space-y-12">
            {roadmap.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                    <h2 className="text-3xl font-bold flex items-center mb-6">
                        <Milestone className="mr-4 h-8 w-8 text-primary" />
                        {section.sectionTitle}
                    </h2>
                    <div className="relative border-l-4 border-primary pl-8 space-y-8">
                        {section.steps.map((step, stepIndex) => (
                            <Card key={stepIndex} className="shadow-md hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="text-xl flex items-center">
                                        <BookOpen className="mr-3 h-6 w-6 text-blue-500" />
                                        {step.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground mb-4">{step.description}</p>
                                    {step.resourceLink && (
                                        <a href={step.resourceLink} target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline" size="sm">
                                                <LinkIcon className="mr-2 h-4 w-4" />
                                                View Resource
                                            </Button>
                                        </a>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
            <div className="text-center mt-12">
                <Link href={`/take-interview?career=${encodeURIComponent(careerTitle || 'your-chosen-field')}`}>
                    <Button size="lg">
                        I'm Ready to Practice! Start Mock Interview
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default function RoadmapPage() {
    const searchParams = useSearchParams();
    const careerTitle = searchParams.get('career') || "Your Career";

    return (
        <AuthGuard>
            <MainLayout>
                <div className="container py-12">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold">Your Personalized Roadmap to Becoming a {careerTitle}</h1>
                        <p className="text-lg text-muted-foreground mt-2">Follow these steps to build your skills and land your dream job.</p>
                    </div>
                    <Suspense fallback={<div className="flex justify-center"><LoaderCircle className="h-12 w-12 animate-spin text-primary mx-auto" /></div>}>
                        <RoadmapContent />
                    </Suspense>
                </div>
            </MainLayout>
        </AuthGuard>
    );
}