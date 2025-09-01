'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Lightbulb, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';

// --- Type Definitions ---
type CodingQuestion = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
};

type SubmissionResult = {
  passCount: number;
  totalCount: number;
  details: string;
};

// --- Main Component ---
export default function TechnicalAssessmentPage() {
  const params = useParams();
  const assessmentId = params.assessmentId as string;

  // --- State Management ---
  const [question, setQuestion] = useState<CodingQuestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('// Start your code here...');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

  // --- Data Fetching ---
  useEffect(() => {
    if (!assessmentId) return;

    const fetchQuestion = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/assessment/${assessmentId}`);
        if (!response.ok) {
          throw new Error('Failed to load assessment. Please check the URL and try again.');
        }
        const data = await response.json();
        setQuestion(data.question);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestion();
  }, [assessmentId]);

  // --- Event Handlers ---
  const handleSubmit = async () => {
    if (!question) return;

    try {
      setIsSubmitting(true);
      setSubmissionResult(null);
      
      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId,
          questionId: question.id,
          code,
          language,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit solution.');
      }
      
      setSubmissionResult(result.results);
      toast.success('Evaluation Complete!', {
        description: `${result.results.passCount} out of ${result.results.totalCount} test cases passed.`,
      });

    } catch (err) {
      toast.error('Submission Failed', {
        description: err instanceof Error ? err.message : 'An unknown error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI Rendering ---
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="h-screen w-screen bg-background text-foreground flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-2 border-b shrink-0">
          <h1 className="text-lg font-bold">
            <span className="text-primary">Forti</span>Twin Technical Assessment
          </h1>
          <div className="flex items-center gap-4">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Terminal className="mr-2 h-4 w-4" />
              )}
              Run & Submit
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <ResizablePanelGroup direction="horizontal" className="flex-grow">
          {/* Left Panel: Question */}
          <ResizablePanel defaultSize={40} minSize={25}>
            <div className="p-6 h-full overflow-y-auto">
              <Card className="h-full border-none shadow-none">
                <CardHeader>
                  <CardTitle className="text-2xl">{question?.title}</CardTitle>
                  <CardDescription>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${question?.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {question?.difficulty}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{question?.description}</p>
                  <Alert className="mt-6">
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle>Instructions</AlertTitle>
                    <AlertDescription>
                      Ensure your code returns the value in the exact format specified. Do not add extra print statements to your final code.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel: Editor & Output */}
          <ResizablePanel defaultSize={60} minSize={40}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={75} minSize={50}>
                <Editor
                  height="100%"
                  language={language}
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  options={{ minimap: { enabled: false } }}
                />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={25} minSize={15}>
                <div className="p-4 h-full">
                  <h3 className="text-lg font-semibold mb-2">Evaluation Result</h3>
                  <div className="bg-muted rounded-md p-4 h-[calc(100%-2rem)]">
                    {isSubmitting && <p className="text-sm text-muted-foreground">Evaluating your code...</p>}
                    {submissionResult && (
                      submissionResult.passCount === submissionResult.totalCount ? (
                         <div className="text-green-500 flex items-center">
                           <CheckCircle className="mr-2 h-5 w-5" />
                           <p><strong>Success!</strong> All {submissionResult.totalCount} test cases passed.</p>
                         </div>
                      ) : (
                         <div className="text-red-500 flex items-center">
                           <XCircle className="mr-2 h-5 w-5" />
                           <p><strong>Failed:</strong> Only {submissionResult.passCount} of {submissionResult.totalCount} test cases passed.</p>
                         </div>
                      )
                    )}
                    {!isSubmitting && !submissionResult && <p className="text-sm text-muted-foreground">Click "Run & Submit" to see the results.</p>}
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
}

// --- Helper Components for UI States ---
function LoadingSkeleton() {
  return (
    <div className="p-6 h-screen">
      <Skeleton className="h-12 w-1/3 mb-4" />
      <Skeleton className="h-6 w-1/4 mb-8" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-screen">
      <Alert variant="destructive" className="w-1/2">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
}