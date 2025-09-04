"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CodingQuestion {
  id: string;
  title: string;
  difficulty: string;
  createdAt: string;
}

const initialFormState = {
  title: "",
  description: "",
  difficulty: "",
  testCases: `[{"input": "1, 2", "expectedOutput": "3"}]`,
};

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<CodingQuestion[]>([]);
  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchQuestions = async () => {
    try {
        const questionsRes = await fetch("/api/admin/questions");
        if (!questionsRes.ok) throw new Error("Failed to fetch questions");
        const questionsData = await questionsRes.json();
        setQuestions(questionsData);
    } catch (error) {
        toast({ title: "Error", description: "Could not fetch questions.", variant: "destructive" });
    }
  }

  useEffect(() => {
    fetchQuestions();
  }, [toast]);
  
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (id: string, value: string) => {
      setFormData(prev => ({ ...prev, [id]: value}));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let parsedTestCases;
      try {
        parsedTestCases = JSON.parse(formData.testCases);
      } catch (jsonError) {
        throw new Error("Test cases are not valid JSON. Please check for syntax errors.");
      }

      const response = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, testCases: parsedTestCases }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Better error handling to display detailed validation messages
        if (result.details?.fieldErrors) {
          const errorMessages = Object.entries(result.details.fieldErrors)
            .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
            .join(' | ');
          throw new Error(errorMessages);
        }
        throw new Error(result.error || "An unknown error occurred.");
      }

      toast({
        title: "Success!",
        description: `Question "${formData.title}" has been created.`,
      });

      setFormData(initialFormState);
      fetchQuestions(); // Refresh the list

    } catch (error: any) {
      toast({
        title: "Error Creating Question",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Question Bank</CardTitle>
            <CardDescription>
              A list of all coding questions in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.title}</TableCell>
                    <TableCell>
                        <Badge variant={q.difficulty === 'Hard' ? 'destructive' : q.difficulty === 'Medium' ? 'secondary' : 'default'}>
                            {q.difficulty}
                        </Badge>
                    </TableCell>
                    <TableCell>{new Date(q.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Add New Question</CardTitle>
            <CardDescription>
              Add a new coding problem to the question bank.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Question Title</Label>
                <Input id="title" placeholder="e.g., Two Sum" value={formData.title} onChange={handleFormChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={(value) => handleSelectChange('difficulty', value)} required>
                    <SelectTrigger><SelectValue placeholder="Select a difficulty..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Provide a detailed problem description." value={formData.description} onChange={handleFormChange} required />
              </div>

               <div className="space-y-2">
                <Label htmlFor="testCases">Test Cases (JSON format)</Label>
                <Textarea id="testCases" placeholder='[{"input": "1, 2", "expectedOutput": "3"}]' value={formData.testCases} onChange={handleFormChange} required rows={5}/>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                {isLoading ? "Adding..." : "Add Question"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}