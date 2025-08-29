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
      title: "Two Sum",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
      code: `function twoSum(nums, target) {\n  // Your implementation here\n}`,
      constraints: [
        "2 ≤ nums.length ≤ 10^4",
        "-10^9 ≤ nums[i] ≤ 10^9",
        "-10^9 ≤ target ≤ 10^9",
        "Only one valid answer exists."
      ],
      example: `Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].\n\nInput: nums = [3,2,4], target = 6\nOutput: [1,2]\n\nInput: nums = [3,3], target = 6\nOutput: [0,1]`
    },
    hard: {
      title: "Longest Substring Without Repeating Characters",
      description: "Given a string s, find the length of the longest substring without repeating characters.",
      code: `function lengthOfLongestSubstring(s) {\n  // Your implementation here\n}`,
      constraints: [
        "0 ≤ s.length ≤ 5 * 10^4",
        "s consists of English letters, digits, symbols and spaces."
      ],
      example: `Input: s = "abcabcbb"\nOutput: 3\nExplanation: The answer is "abc", with the length of 3.\n\nInput: s = "bbbbb"\nOutput: 1\nExplanation: The answer is "b", with the length of 1.\n\nInput: s = "pwwkew"\nOutput: 3\nExplanation: The answer is "wke", with the length of 3.\nNotice that the answer must be a substring, "pwke" is a subsequence and not a substring.`
    }
};

export default function ProblemSolvingPage() {
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
            <h1 className="text-lg font-semibold">Problem Solving Assessment</h1>
          </div>
          <div className="text-sm text-muted-foreground">Question 1/6</div>
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