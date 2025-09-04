'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Users, Search, FilePlus2, AlertTriangle, LoaderCircle } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

// Define data types
type Candidate = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

type CodingQuestion = {
    id: string;
    title: string;
    difficulty: string;
};

export default function HrDashboardUpgraded() {
  const router = useRouter();
  const { toast } = useToast();
  
  // ✅ FIX: Get both the user and the loading status from the auth store
  const { user, isLoading: isAuthLoading } = useAuthStore();

  // State for page data
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [questions, setQuestions] = useState<CodingQuestion[]>([]);
  
  // State for page UI
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // State for the dialog form
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // ✅ FIX: Wait until the authentication check is complete before doing anything
    if (isAuthLoading) {
      return; 
    }
    
    // If auth is done and there's no user, or the user is not HR, redirect.
    if (!user || user.role.toUpperCase() !== 'HR') {
        router.push('/login');
        return;
    }

    // If we have a valid HR user, proceed to fetch data for the dashboard
    const fetchData = async () => {
      setIsDataLoading(true);
      try {
        const [candsRes, questsRes] = await Promise.all([
            fetch('/api/hr/candidates'),
            fetch('/api/admin/questions')
        ]);

        if (!candsRes.ok || !questsRes.ok) throw new Error("Failed to fetch page data");
        
        const candsData = await candsRes.json();
        const questsData = await questsRes.json();

        setCandidates(candsData);
        setQuestions(questsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchData();

  }, [user, isAuthLoading, router]);

  const handleCreateAssessment = async () => {
    // This function is correct
    setIsSubmitting(true);
    try {
        const response = await fetch('/api/hr/assessments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                candidateId: selectedCandidate,
                questionIds: selectedQuestions,
            }),
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || "Failed to create assessment");
        }
        
        toast({ title: "Success", description: "New assessment has been assigned."});
        setSelectedCandidate('');
        setSelectedQuestions([]);
        setIsDialogOpen(false);
    } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive"});
    } finally {
        setIsSubmitting(false);
    }
  };

  const filteredCandidates = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase())
  );

  // ✅ FIX: Show a full-page loading spinner while waiting for auth and initial data
  if (isAuthLoading || isDataLoading) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center">
            <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
  }
  
  // The rest of your component's JSX is well-structured and does not need changes.
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden md:flex w-72 flex-col border-r bg-card fixed inset-y-0">
        <div className="p-5 border-b">
          <h2 className="font-extrabold text-2xl">
            <span className="text-primary">Forti</span>Twin
          </h2>
          <p className="text-xs text-muted-foreground mt-1">HR Dashboard</p>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          <Button variant={'secondary'} className="w-full justify-start">
            <Users className="mr-2 h-4 w-4" />
            Candidates
          </Button>
        </nav>
      </aside>
      <main className="flex-1 md:ml-72">
        <div className="p-6 md:pt-8 md:px-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center mb-6 md:mb-8 justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Candidate Management</h1>
              <p className="text-muted-foreground mt-1">
                View, track, and manage all candidates in your pipeline.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ModeToggle />
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button><FilePlus2 className="mr-2 h-4 w-4" />Create Assessment</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create New Assessment</DialogTitle>
                        <DialogDescription>Assign a technical assessment to a candidate.</DialogDescription>
                    </DialogHeader>
                    {/* Dialog Content */}
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="candidate">Candidate</Label>
                            <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
                                <SelectTrigger><SelectValue placeholder="Select a candidate..." /></SelectTrigger>
                                <SelectContent>
                                    {candidates.map(c => <SelectItem key={c.id} value={c.id}>{c.name} ({c.email})</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Coding Questions</Label>
                            <p className="text-sm text-muted-foreground">Select one or more questions.</p>
                            <div className="max-h-48 overflow-y-auto space-y-2 rounded-md border p-2">
                                {questions.map(q => (
                                    <div key={q.id} className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${selectedQuestions.includes(q.id) ? 'bg-primary/10' : ''}`}
                                        onClick={() => {
                                            setSelectedQuestions(prev => 
                                                prev.includes(q.id) ? prev.filter(id => id !== q.id) : [...prev, q.id]
                                            );
                                        }}
                                    >
                                        <span>{q.title}</span>
                                        <Badge variant="secondary">{q.difficulty}</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateAssessment} disabled={isSubmitting || !selectedCandidate || selectedQuestions.length === 0}>
                            {isSubmitting ? "Assigning..." : "Assign Assessment"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
            {/* Main Content Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Candidates</CardTitle>
                            <CardDescription>A list of all registered candidates.</CardDescription>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                className="pl-10 w-64"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Registered On</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {error && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-10">
                                            <div className="flex flex-col items-center gap-2 text-destructive">
                                                <AlertTriangle className="h-8 w-8" />
                                                <p className="font-semibold">Failed to load data</p>
                                                <p className="text-sm">{error}</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!error && filteredCandidates.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                            No candidates found.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!error && filteredCandidates.map((candidate) => (
                                    <TableRow key={candidate.id}>
                                        <TableCell className="font-medium">{candidate.name}</TableCell>
                                        <TableCell>{candidate.email}</TableCell>
                                        <TableCell>{new Date(candidate.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => {
                                                setSelectedCandidate(candidate.id);
                                                setIsDialogOpen(true);
                                            }}>
                                                <FilePlus2 className="mr-2 h-4 w-4" />
                                                Assign
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}