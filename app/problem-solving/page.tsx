// app/problem-solving/page.tsx

"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { CodeEditor } from "@/components/code-editor"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Play, Send } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function ProblemSolvingPage() {
  const [code, setCode] = useState(`function twoSum(nums, target) {\n  // Your implementation here\n}`)
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [isError, setIsError] = useState(false);

  const problem = {
      id: "problem-solving-q1",
      language: "javascript",
      title: "Two Sum",
      description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
      constraints: [
        "2 ≤ nums.length ≤ 10^4",
        "-10^9 ≤ nums[i] ≤ 10^9",
        "-10^9 ≤ target ≤ 10^9",
        "Only one valid answer exists."
      ],
      examples: `Example 1:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]`
  };

  const handleRunCode = async () => {
    setIsLoading(true);
    setOutput("");
    setIsError(false);
    try {
      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: problem.id,
          code: code,
          language: problem.language,
        }),
      });
      const result = await response.json();
      setOutput(result.output || result.error);
      setIsError(result.isError);
      if (result.isError) {
        toast.error("Execution Failed");
      } else {
        toast.success("Execution Successful!");
      }
    } catch (error) {
      toast.error("Server Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitSolution = () => {
    toast.info("Submit Clicked!");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b shrink-0">
        <div className="container h-16 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/assessment-list">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Assessments</span>
              </Link>
            </Button>
            <h1 className="text-lg font-semibold">Problem Solving Assessment</h1>
          </div>
          <div className="text-sm text-muted-foreground">Question 1/6</div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={40} minSize={25}>
            <ScrollArea className="h-full p-6">
                <div className="space-y-6">
                    <Card><CardHeader><CardTitle className="text-xl">{problem.title}</CardTitle></CardHeader><CardContent><p className="text-muted-foreground whitespace-pre-line">{problem.description}</p></CardContent></Card>
                    <Card><CardHeader><CardTitle className="text-lg">Constraints</CardTitle></CardHeader><CardContent><ul className="list-disc list-inside text-muted-foreground space-y-2">{problem.constraints.map((c, i) => <li key={i}>{c}</li>)}</ul></CardContent></Card>
                    <Card><CardHeader><CardTitle className="text-lg">Examples</CardTitle></CardHeader><CardContent className="bg-muted rounded-md p-4"><pre className="text-sm font-mono whitespace-pre-wrap">{problem.examples}</pre></CardContent></Card>
                </div>
            </ScrollArea>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={60} minSize={30}>
            <div className="h-full flex flex-col">
              <div className="p-4 border-b">
                <h2 className="font-medium">Your Solution</h2>
              </div>
              <div className="flex-1 overflow-hidden">
                <CodeEditor value={code} onChange={setCode} language="javascript" />
              </div>
              <div className="h-48 border-t bg-muted/30">
                <div className="p-4 h-full">
                  <h3 className="font-semibold mb-2 text-sm">Output</h3>
                  <ScrollArea className="h-[calc(100%-2rem)]">
                    <pre className={cn("text-sm font-mono whitespace-pre-wrap", isError ? "text-red-500" : "text-muted-foreground")}>
                      {isLoading ? "Executing..." : output || "Click 'Run Tests' to see the output."}
                    </pre>
                  </ScrollArea>
                </div>
              </div>
              <div className="p-4 flex justify-end gap-4 border-t bg-background">
                <Button variant="outline" onClick={handleRunCode} disabled={isLoading}>
                  <Play className="mr-2 h-4 w-4" />
                  {isLoading ? "Running..." : "Run Tests"}
                </Button>
                <Button onClick={handleSubmitSolution} disabled={isLoading}>
                  <Send className="mr-2 h-4 w-4" />
                  Submit
                </Button>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  )
}