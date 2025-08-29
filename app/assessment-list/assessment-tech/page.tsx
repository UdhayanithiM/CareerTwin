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

// --- Data Types and Definitions (no change) ---
type DifficultyLevel = 'easy' | 'medium' | 'hard';

interface Question {
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
      title: "Find Maximum Element",
      description: "Write a function that finds the maximum element in an array of integers.",
      code: `function findMax(arr) {\n  // Your implementation here\n}`,
      constraints: [
        "1 ≤ arr.length ≤ 10^5",
        "-10^9 ≤ arr[i] ≤ 10^9"
      ],
      example: `Input: [3, 7, 2, 9, 1, 5]\nOutput: 9\n\nInput: [-3, -7, -2, -9, -1, -5]\nOutput: -1`
    },
    medium: {
      title: "Maximum Depth of Binary Tree",
      description: "Given the root of a binary tree, return its maximum depth. A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
      code: `class TreeNode {\n  constructor(val) {\n    this.val = val;\n    this.left = null;\n    this.right = null;\n  }\n}\n\nfunction maxDepth(root) {\n  // Your implementation here\n}`,
      constraints: [
        "The number of nodes in the tree is in the range [0, 10^4]",
        "-100 ≤ Node.val ≤ 100"
      ],
      example: `Input: root = [3,9,20,null,null,15,7]\nOutput: 3\nExplanation:\n    3\n   / \\\n  9  20\n    /  \\\n   15   7\n\nInput: root = [1,null,2]\nOutput: 2`
    },
    hard: {
      title: "Trapping Rain Water",
      description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
      code: `function trap(height) {\n  // Your implementation here\n}`,
      constraints: [
        "n == height.length",
        "1 ≤ n ≤ 2 * 10^4",
        "0 ≤ height[i] ≤ 10^5"
      ],
      example: `Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6\nExplanation: The elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped.\n\nInput: height = [4,2,0,3,2,5]\nOutput: 9`
    }
};

export default function TechnicalAssessmentPage() {
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>("medium");
  const [code, setCode] = useState(questions[difficultyLevel].code);
  const currentQuestion = questions[difficultyLevel];

  // Effect to update code in editor when difficulty changes
  useEffect(() => {
    setCode(questions[difficultyLevel].code);
  }, [difficultyLevel]);

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
            <h1 className="text-lg font-semibold">Technical Assessment</h1>
          </div>
          <div className="text-sm text-muted-foreground">Question 1/10</div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Difficulty Selector */}
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

        {/* Resizable Layout */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Left Panel - Question Details */}
          <ResizablePanel defaultSize={40} minSize={25}>
            <ScrollArea className="h-full p-6">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">{currentQuestion.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{currentQuestion.description}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Constraints</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                {currentQuestion.constraints.map((constraint, index) => (
                                    <li key={index}>{constraint}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Example</CardTitle>
                        </CardHeader>
                        <CardContent className="bg-muted rounded-md p-4">
                            <pre className="text-sm font-mono whitespace-pre-wrap">
                                {currentQuestion.example}
                            </pre>
                        </CardContent>
                    </Card>
                </div>
            </ScrollArea>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Code Editor */}
          <ResizablePanel defaultSize={60} minSize={30}>
            <div className="h-full flex flex-col">
              <div className="p-4 border-b">
                <h2 className="font-medium">Your Solution</h2>
              </div>

              <div className="flex-1 overflow-hidden">
                <CodeEditor value={code} onChange={setCode} language="javascript" />
              </div>

              <div className="p-4 flex justify-end gap-4 border-t bg-background">
                <Button variant="outline">
                  <Play className="mr-2 h-4 w-4" />
                  Run Tests
                </Button>
                <Button>
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