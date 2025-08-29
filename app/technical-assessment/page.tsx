"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { CodeEditor } from "@/components/code-editor"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Play, Send } from "lucide-react"

export default function TechnicalAssessmentPage() {
  const [code, setCode] = useState(`class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

function maxDepth(root) {
  // Your implementation here
}`)

  const problem = {
      title: "Maximum Depth of Binary Tree",
      description: "Given the root of a binary tree, return its maximum depth. A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
      constraints: [
        "The number of nodes in the tree is in the range [0, 10^4].",
        "-100 ≤ Node.val ≤ 100"
      ],
      example: `Input: root = [3,9,20,null,null,15,7]
Output: 3
Explanation:
    3
   / \\
  9  20
    /  \\
   15   7

Input: root = [1,null,2]
Output: 2`
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
            <h1 className="text-lg font-semibold">Technical Assessment</h1>
          </div>
          <div className="text-sm text-muted-foreground">Question 1/10</div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Left Panel - Question Details */}
          <ResizablePanel defaultSize={40} minSize={25}>
            <ScrollArea className="h-full p-6">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">{problem.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground whitespace-pre-line">{problem.description}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Constraints</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                {problem.constraints.map((constraint, index) => (
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
                                {problem.example}
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