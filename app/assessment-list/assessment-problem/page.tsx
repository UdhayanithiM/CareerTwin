"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { CodeEditor } from "@/components/code-editor"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Play, Send } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type DifficultyLevel = 'easy' | 'medium' | 'hard';

interface Question {
  id: string;
  title: string;
  description: string;
  code: string;
  constraints: string[];
  example: string;
}

interface Questions {
  easy: Question;
  medium: Question;
  hard: Question;
}

const questions: Questions = {
    easy: {
      id: "problem-easy-anagram",
      title: "Valid Anagram",
      description: "Given two strings s and t, return true if t is an anagram of s, and false otherwise. An anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
      code: `function isAnagram(s, t) {\n  // Your implementation here\n}`,
      constraints: [
        "1 ≤ s.length, t.length ≤ 5 * 10^4",
        "s and t consist of lowercase English letters."
      ],
      example: `Input: s = "anagram", t = "nagaram"\nOutput: true\n\nInput: s = "rat", t = "car"\nOutput: false`
    },
    medium: {
      id: "problem-medium-two-sum",
      title: "Two Sum",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
      code: `function twoSum(nums, target) {\n  // Your implementation here\n}`,
      constraints: [
        "2 ≤ nums.length ≤ 10^4",
        "-10^9 ≤ nums[i] ≤ 10^9",
        "-10^9 ≤ target ≤ 10^9",
        "Only one valid answer exists."
      ],
      example: `Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\n\nInput: nums = [3,2,4], target = 6\nOutput: [1,2]`
    },
    hard: {
      id: "problem-hard-longest-substring",
      title: "Longest Substring Without Repeating Characters",
      description: "Given a string s, find the length of the longest substring without repeating characters.",
      code: `function lengthOfLongestSubstring(s) {\n  // Your implementation here\n}`,
      constraints: [
        "0 ≤ s.length ≤ 5 * 10^4",
        "s consists of English letters, digits, symbols and spaces."
      ],
      example: `Input: s = "abcabcbb"\nOutput: 3\n\nInput: s = "bbbbb"\nOutput: 1`
    }
};

export default function ProblemSolvingPage() {
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>("medium");
  const [code, setCode] = useState(questions[difficultyLevel].code);
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<any[]>([]);
  const currentQuestion = questions[difficultyLevel];

  useEffect(() => {
    setCode(questions[difficultyLevel].code);
    setOutput([]);
  }, [difficultyLevel]);

  const handleRunCode = async () => {
    setIsLoading(true);
    setOutput([]);
    try {
      const response = await fetch('/api/assessment/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          code: code,
          language: 'javascript',
        }),
      });

      const result = await response.json();

      if (result.error) {
        toast.error("Evaluation Failed", { description: result.error });
        setOutput([{ status: 'error', message: result.error }]);
      } else {
        toast.success("Evaluation Complete!");
        setOutput(result.results);
      }
    } catch (error) {
      toast.error("Server Error", { description: "Could not connect to the evaluation engine." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitSolution = () => {
    toast.info("Submit Clicked!", {
      description: "This feature will be implemented soon.",
    });
  }

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
        <div className="border-b p-3">
          <Tabs
            value={difficultyLevel}
            onValueChange={(value) => setDifficultyLevel(value as DifficultyLevel)}
            className="w-full max-w-sm mx-auto"
          >
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="easy">Easy</TabsTrigger>
              <TabsTrigger value="medium">Medium</TabsTrigger>
              <TabsTrigger value="hard">Hard</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={40} minSize={25}>
            <ScrollArea className="h-full p-6">
              <div className="space-y-6">
                <Card><CardHeader><CardTitle className="text-xl">{currentQuestion.title}</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{currentQuestion.description}</p></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-lg">Constraints</CardTitle></CardHeader><CardContent><ul className="list-disc list-inside text-muted-foreground space-y-2">{currentQuestion.constraints.map((c, i) => <li key={i}>{c}</li>)}</ul></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-lg">Example</CardTitle></CardHeader><CardContent className="bg-muted rounded-md p-4"><pre className="text-sm font-mono whitespace-pre-wrap">{currentQuestion.example}</pre></CardContent></Card>
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
                    {isLoading ? (
                      <p className="text-sm text-muted-foreground">Evaluating...</p>
                    ) : (
                      <div className="space-y-2">
                        {output.length === 0 && <p className="text-sm text-muted-foreground">Click 'Run Tests' to evaluate your code.</p>}
                        {output.map((result, index) => (
                          <div key={index} className={cn("text-sm", result.status === 'passed' ? 'text-green-500' : 'text-red-500')}>
                            Test Case {index + 1}: {result.status}
                            {result.status === 'failed' && <p className="text-xs">Expected: {JSON.stringify(result.expected)}, Got: {JSON.stringify(result.actual)}</p>}
                             {result.status === 'error' && <p className="text-xs">{result.message}</p>}
                          </div>
                        ))}
                      </div>
                    )}
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
                  Submit Solution
                </Button>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  )
}