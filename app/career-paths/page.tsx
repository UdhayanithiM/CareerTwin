// app/career-paths/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // ✨ Import useRouter
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoaderCircle, Briefcase, IndianRupee, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner'; // ✨ Import toast
import { AuthGuard } from "@/components/AuthGuard";
import { apiClient } from '@/lib/apiClient'; // ✨ Import the apiClient

interface CareerPath {
  title: string;
  description: string;
  matchScore: number;
  avgSalary: string;
}

function CareerPathsContent() {
  const searchParams = useSearchParams();
  const router = useRouter(); // ✨ Initialize router
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const strengths = searchParams.get('strengths');
  const gaps = searchParams.get('gaps');

  useEffect(() => {
    const fetchCareerPaths = async () => {
      if (strengths && gaps) {
        try {
          // ✨ USE THE NEW API CLIENT'S 'post' METHOD
          const data = await apiClient.post('/api/career-paths', {
            strengths: strengths.split(','),
            gaps: gaps.split(','),
          });
          setPaths(data.careerPaths);
        } catch (err: any) {
          // ✨ Use toast for user-friendly error feedback
          toast.error("Failed to load career paths", {
            description: err.message,
          });
          if (err.message.toLowerCase().includes("authenticated")) {
            router.push('/login');
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        toast.error("Analysis data not found", {
          description: "Please analyze your resume first.",
        });
        setIsLoading(false);
        router.push('/analyze');
      }
    };

    fetchCareerPaths();
  }, [strengths, gaps, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Our AI Analyst is finding the best career paths for you...</p>
      </div>
    );
  }

  // ✨ The old error text is no longer needed
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {paths.map((path, index) => (
        <Card key={index} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Briefcase className="mr-3 h-7 w-7 text-primary" />
              {path.title}
            </CardTitle>
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
    <AuthGuard>
      <MainLayout>
        <div className="container py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold">Your Recommended Career Paths</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Based on your resume, here are the top roles where you'd excel.
            </p>
          </div>
          <Suspense fallback={<div className="flex justify-center"><LoaderCircle className="h-12 w-12 animate-spin text-primary" /></div>}>
            <CareerPathsContent />
          </Suspense>
        </div>
      </MainLayout>
    </AuthGuard>
  );
}