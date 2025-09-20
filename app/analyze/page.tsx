// File: app/analyze/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoaderCircle, Sparkles, Briefcase, Wand2 } from 'lucide-react';
import Link from 'next/link';

// Define a clear type for the analysis results for better code quality.
interface AnalysisResult {
  skills: string[];
  careerPaths: {
    title: string;
    justification: string;
  }[];
}

export default function AnalyzePage() {
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError('');
    setAnalysis(null);
    try {
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText }),
      });
      if (!response.ok) {
        throw new Error('Failed to get analysis. The AI might be busy. Please try again.');
      }
      const data = await response.json();
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container py-12">
        <Card className="max-w-4xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Your AI Career Analysis</CardTitle>
            <p className="text-muted-foreground text-center">Paste your resume to get instant clarity on your skills and career path.</p>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste your full resume here..."
              className="min-h-[250px] text-base shadow-inner"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
            <Button 
              onClick={handleAnalyze} 
              disabled={isLoading || !resumeText.trim()} 
              size="lg" 
              className="mt-4 w-full"
            >
              {isLoading ? <LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
              Analyze My Career
            </Button>
            
            {error && <p className="text-red-500 mt-4 text-center font-semibold">{error}</p>}
            
            {analysis && (
              <div className="mt-8 border-t pt-6 animate-in fade-in duration-500">
                <h3 className="text-2xl font-semibold flex items-center">
                  <Wand2 className="mr-2 h-6 w-6 text-primary"/> Top Skills Identified:
                </h3>
                <div className="flex flex-wrap gap-2 mt-3">
                  {analysis.skills.map((skill: string) => (
                    <div key={skill} className="bg-primary/10 text-primary font-medium px-3 py-1 rounded-full">
                      {skill}
                    </div>
                  ))}
                </div>
                
                <h3 className="text-2xl font-semibold mt-6 flex items-center">
                  <Briefcase className="mr-2 h-6 w-6 text-primary"/> Recommended Career Paths:
                </h3>
                <p className="text-muted-foreground">Select a path below to start a tailored mock interview.</p>
                <div className="space-y-4 mt-3">
                  {analysis.careerPaths.map((path: any) => (
                    // This Link component creates the seamless connection to the interview page.
                    <Link 
                      key={path.title}
                      // It dynamically creates a URL like "/take-interview/Product-Manager"
                      href={`/take-interview/${encodeURIComponent(path.title.replace(/\s+/g, '-'))}`}
                      className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors shadow-sm"
                    >
                      <h4 className="font-bold text-lg text-primary">{path.title}</h4>
                      <p className="text-muted-foreground">{path.justification}</p>
                      <span className="text-sm font-semibold text-primary mt-2 inline-block">Practice for this role →</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}