// components/interview/FeedbackSummary.tsx
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LoaderCircle, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Feedback {
  overallScore: number;
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
}

interface FeedbackSummaryProps {
  messages: ChatMessage[];
  interviewContext: string;
}

export function FeedbackSummary({ messages, interviewContext }: FeedbackSummaryProps) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const getFeedback = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch('/api/interview/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages, interviewContext }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate feedback.');
        }
        setFeedback(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    getFeedback();
  }, [messages, interviewContext]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg font-semibold">Generating your feedback report...</p>
        <p className="text-muted-foreground">The AI Coach is analyzing your performance.</p>
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="mt-4 text-lg font-semibold text-destructive">Failed to generate feedback</p>
        <p className="text-muted-foreground">{error}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <Card className="shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Interview Report</CardTitle>
          <CardDescription>A summary of your performance for the {interviewContext} role.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg font-semibold text-muted-foreground">Overall Score</p>
            <p className="text-7xl font-bold text-primary">{feedback.overallScore}%</p>
            <Progress value={feedback.overallScore} className="w-1/2 mx-auto mt-2 h-3" />
          </div>
          <p className="text-center text-muted-foreground italic">"{feedback.summary}"</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-xl flex items-center text-green-600"><CheckCircle className="mr-2 h-6 w-6"/> What Went Well</h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-xl flex items-center text-orange-600"><AlertTriangle className="mr-2 h-6 w-6"/> Areas for Improvement</h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {feedback.areasForImprovement.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-center mt-8">
        <Button asChild>
          <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}