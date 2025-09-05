// app/technical-assessment/[assessmentId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { CodeEditor } from "@/components/code-editor";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Play,
  Send,
  LoaderCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// --- TYPES ---
interface CodingQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: string;
}

interface TechnicalAssessment {
  id: string;
  status: string;
  questionIds: string[];
  questions: CodingQuestion[];
}

interface EvaluationResult {
  questionId: string;
  title: string;
  testCases: {
    status: "passed" | "failed" | "error";
    message?: string;
    expected?: any;
    actual?: any;
  }[];
}

// --- MAIN PAGE ---
export default function TechnicalAssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const assessmentId = params?.assessmentId as string;

  const [assessment, setAssessment] =
    useState<TechnicalAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState(
    `function yourFunctionName() {\n  // Write your code here\n}`
  );
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState<EvaluationResult[] | null>(null);

  // Fetch assessment details
  useEffect(() => {
    if (!assessmentId) return;

    const fetchAssessment = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/assessment/${assessmentId}`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to fetch assessment.");
        }
        const data: TechnicalAssessment = await response.json();
        setAssessment(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId]);

  // Run code tests
  const handleRunCode = async () => {
    if (!assessment) return;
    setIsEvaluating(true);
    setOutput(null);
    try {
      const response = await fetch("/api/assessment/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionIds: assessment.questionIds,
          code,
          language,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Evaluation failed.");
      }

      setOutput(result.results);
      toast({ title: "Evaluation complete" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Evaluation error",
        description:
          err instanceof Error ? err.message : "An unknown error occurred.",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  // Submit solution
  const handleSubmitSolution = async () => {
    if (!assessment) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/assessment/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId,
          questionIds: assessment.questionIds,
          code,
          language,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Submission failed.");
      }

      toast({
        title: "Submission successful",
        description: "Redirecting to your dashboard...",
      });
      router.push("/dashboard");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Submission error",
        description:
          err instanceof Error ? err.message : "An unknown error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay message={error} />;
  if (!assessment)
    return <ErrorDisplay message="Assessment could not be loaded." />;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b shrink-0">
        <div className="container h-16 flex justify-between items-center">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">Technical Assessment</h1>
          <div className="text-sm text-muted-foreground">
            {assessment.questions.length} Question
            {assessment.questions.length > 1 ? "s" : ""}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Questions Panel */}
          <ResizablePanel defaultSize={40} minSize={25}>
            <ScrollArea className="h-full p-6">
              <div className="space-y-6">
                {assessment.questions.map((q) => (
                  <Card key={q.id}>
                    <CardHeader>
                      <CardTitle>{q.title}</CardTitle>
                      <CardDescription>
                        Difficulty: {q.difficulty}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-line">
                        {q.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Code Editor Panel */}
          <ResizablePanel defaultSize={60} minSize={30}>
            <div className="h-full flex flex-col">
              {/* Language Selector + Title */}
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-medium">Your Solution</h2>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="language-select"
                    className="text-sm font-medium"
                  >
                    Language:
                  </label>
                  <select
                    id="language-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="border rounded p-1 text-sm"
                    aria-label="Select programming language"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="c">C</option>
                  </select>
                </div>
              </div>

              {/* Editor */}
              <div className="flex-1 overflow-hidden">
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language={language}
                />
              </div>

              {/* Output */}
              <div className="h-56 border-t bg-muted/30">
                <ScrollArea className="h-full p-4">
                  <h3 className="font-semibold mb-2 text-sm">Output</h3>
                  {isEvaluating && (
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                  )}
                  {!isEvaluating && !output && (
                    <p className="text-sm text-muted-foreground">
                      Click 'Run Tests' to see results.
                    </p>
                  )}
                  {output && <OutputDisplay results={output} />}
                </ScrollArea>
              </div>

              {/* Actions */}
              <div className="p-4 flex justify-end gap-4 border-t bg-background">
                <Button
                  variant="outline"
                  onClick={handleRunCode}
                  disabled={isEvaluating || isSubmitting}
                >
                  {isEvaluating ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  {isEvaluating ? "Running..." : "Run Tests"}
                </Button>
                <Button
                  onClick={handleSubmitSolution}
                  disabled={isEvaluating || isSubmitting}
                >
                  {isSubmitting ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  {isSubmitting ? "Submitting..." : "Submit Solution"}
                </Button>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
}

// --- OUTPUT DISPLAY ---
const OutputDisplay = ({ results }: { results: EvaluationResult[] }) => (
  <div className="space-y-4">
    {results.map((res) => (
      <div key={res.questionId}>
        <h4 className="font-semibold text-sm mb-2">{res.title}</h4>
        <div className="space-y-2">
          {res.testCases.map((tc, index) => (
            <div key={index} className="text-xs flex items-start">
              {tc.status === "passed" && (
                <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-2 mt-0.5 shrink-0" />
              )}
              {tc.status === "failed" && (
                <XCircle className="h-3.5 w-3.5 text-red-500 mr-2 mt-0.5 shrink-0" />
              )}
              {tc.status === "error" && (
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 mr-2 mt-0.5 shrink-0" />
              )}
              <div>
                <span
                  className={cn(
                    "font-medium",
                    tc.status === "passed" && "text-green-500",
                    tc.status === "failed" && "text-red-500"
                  )}
                >
                  Test Case {index + 1}: {tc.status}
                </span>
                {tc.status === "failed" && (
                  <p className="text-muted-foreground">
                    Expected: {JSON.stringify(tc.expected)}, Got:{" "}
                    {JSON.stringify(tc.actual)}
                  </p>
                )}
                {tc.status === "error" && (
                  <p className="text-muted-foreground font-mono bg-muted p-1 rounded">
                    {tc.message}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// --- LOADING ---
const LoadingSkeleton = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
  </div>
);

// --- ERROR DISPLAY ---
const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="flex h-screen w-full items-center justify-center p-4">
    <Card className="w-full max-w-md text-center">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center justify-center">
          <AlertTriangle className="mr-2 h-6 w-6" /> Error
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>{message}</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  </div>
);
