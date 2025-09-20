// app/career-paths/page.tsx
'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoaderCircle, Briefcase, IndianRupee, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';

interface CareerPath {
  title: string;
  description: string;
  matchScore: number;
  avgSalary: string;
}

function CareerPathsContent() {
    const searchParams = useSearchParams();
    const [paths, setPaths] = useState<CareerPath[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // --- FETCH STRENGTHS AND GAPS ---
    // Get the analysis data from the URL query parameters.
    const strengths = searchParams.get('strengths');
    const gaps = searchParams.get('gaps');

    useEffect(() => {
        if (strengths && gaps) {
            const fetchCareerPaths = async () => {
                setIsLoading(true);
                setError('');
                try {
                    const response = await fetch('/api/career-paths', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            strengths: strengths.split(','),
                            gaps: gaps.split(',')
                        }),
                    });
                    const data = await response.json();
                    if (!response.ok) {
                        throw new Error(data.error || 'Failed to fetch career paths');
                    }
                    setPaths(data.careerPaths);
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchCareerPaths();
        } else {
            setError("Analysis data not found. Please analyze your resume first.");
            setIsLoading(false);
        }
    }, [strengths, gaps]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Our AI Analyst is finding the best career paths for you...</p>
            </div>
        );
    }

    if (error) {
        return <p className="text-red-500 text-center font-semibold">{error}</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paths.map((path, index) => (
                <Card key={index} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center text-2xl"><Briefcase className="mr-3 h-7 w-7 text-primary" /> {path.title}</CardTitle>
                        <CardDescription>{path.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                        <div>
                            <p className="font-semibold">Match Score: {path.matchScore}%</p>
                            <Progress value={path.matchScore} className="w-full h-3" />
                        </div>
                        <div className="flex items-center text-muted-foreground">
                            <IndianRupee className="mr-2 h-5 w-5" />
                            <p className="font-semibold">Avg. Salary: {path.avgSalary}</p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        {/* --- UPGRADED LINK --- */}
                        {/* This link now passes the career title, strengths, and gaps to the roadmap page. */}
                        <Link 
                            href={`/roadmap?career=${encodeURIComponent(path.title)}&strengths=${encodeURIComponent(strengths || '')}&gaps=${encodeURIComponent(gaps || '')}`} 
                            className="w-full"
                        >
                            <Button className="w-full">
                                Generate My Roadmap <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}


export default function CareerPathsPage() {
    return (
        <MainLayout>
            <div className="container py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold">Your Recommended Career Paths</h1>
                    <p className="text-lg text-muted-foreground mt-2">Based on your resume, here are the top roles where you'd excel.</p>
                </div>
                <Suspense fallback={<div className="flex justify-center"><LoaderCircle className="h-12 w-12 animate-spin text-primary" /></div>}>
                    <CareerPathsContent />
                </Suspense>
            </div>
        </MainLayout>
    );
}