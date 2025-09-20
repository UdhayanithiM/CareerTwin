// app/roadmap/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LoaderCircle, Milestone, BookOpen, Link as LinkIcon, ArrowRight } from 'lucide-react';

// Define the types to match our API response
interface RoadmapStep {
  title: string;
  description: string;
  resourceLink?: string | null; // Allow null for resourceLink
}

interface RoadmapSection {
  sectionTitle: string;
  steps: RoadmapStep[];
}

function RoadmapContent() {
    const searchParams = useSearchParams();
    const [roadmap, setRoadmap] = useState<RoadmapSection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const careerTitle = searchParams.get('career');
    const strengths = searchParams.get('strengths');
    const gaps = searchParams.get('gaps');

    useEffect(() => {
        if (careerTitle && strengths && gaps) {
            const fetchRoadmap = async () => {
                setIsLoading(true);
                setError('');
                try {
                    const response = await fetch('/api/roadmap', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ careerTitle, strengths: strengths.split(','), gaps: gaps.split(',') }),
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || 'Failed to generate roadmap.');
                    setRoadmap(data.roadmap);
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchRoadmap();
        } else {
            setError("Career information is missing. Please select a career path first.");
            setIsLoading(false);
        }
    }, [careerTitle, strengths, gaps]);

    if (isLoading) {
        return (
            <div className="text-center">
                <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Our AI Strategist is crafting your personalized roadmap...</p>
            </div>
        );
    }

    if (error) {
        return <p className="text-red-500 text-center font-semibold">{error}</p>;
    }

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
                 {/* ✨ FIX: Updated the link to pass the career title to the interview page */}
                 <Link href={`/take-interview/${encodeURIComponent(careerTitle || 'your-chosen-field')}`}>
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
    // Use a fallback for the title to avoid displaying "null"
    const careerTitle = searchParams.get('career') || "Your Career";

    return (
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
    );
}