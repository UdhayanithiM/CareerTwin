// app/hr-dashboard/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Users,
  Search,
  MoreHorizontal,
  FilePlus2,
  Send,
  AlertTriangle, 
} from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';


type Candidate = {
  id: string;
  name: string;
  email: string;
  createdAt: string; 
};

export default function HrDashboardUpgraded() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'candidates'>('candidates');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // =================================================================
        // THE FIX: Fetch data and include credentials for authentication
        // =================================================================
        const response = await fetch('/api/hr/candidates', {
            credentials: 'include', // Sends the auth cookie
        });
        
        if (response.status === 401 || response.status === 403) {
            // If unauthorized or forbidden, redirect to login
            router.push('/login');
            return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch candidates');
        }
        
        const data: Candidate[] = await response.json();
        setCandidates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    // We only fetch if the user is logged in and is an HR professional
    if (user?.role === 'HR') {
        fetchCandidates();
    } else if (!user) {
        // If user info isn't loaded yet, we can wait or redirect.
        // For now, if the auth state is clear but there's no user, redirecting is safe.
        router.push('/login');
    }
  }, [user, router]);

  const filteredCandidates = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase())
  );

  const renderCandidateRows = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={`loading-${i}`}>
          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
          <TableCell><Skeleton className="h-5 w-48" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
        </TableRow>
      ));
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center py-10">
            <div className="flex flex-col items-center gap-2 text-destructive">
              <AlertTriangle className="h-8 w-8" />
              <p className="font-semibold">Failed to load data</p>
              <p className="text-sm">{error}</p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (filteredCandidates.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
            No candidates found.
          </TableCell>
        </TableRow>
      );
    }

    return filteredCandidates.map((candidate) => (
      <TableRow key={candidate.id}>
        <TableCell className="font-medium">{candidate.name}</TableCell>
        <TableCell>{candidate.email}</TableCell>
        <TableCell>{new Date(candidate.createdAt).toLocaleDateString()}</TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-haspopup="true" size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions for {candidate.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => alert(`Assigning assessment to ${candidate.name}`)}>
                <FilePlus2 className="mr-2 h-4 w-4" />
                Assign Assessment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert(`Sending invite to ${candidate.name}`)}>
                <Send className="mr-2 h-4 w-4" />
                Send Invite
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                Delete Candidate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ));
  };


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
           <Button variant={activeTab === 'overview' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('overview')}>
             <Users className="mr-2 h-4 w-4" />
             Overview
           </Button>
           <Button variant={activeTab === 'candidates' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('candidates')}>
             <Users className="mr-2 h-4 w-4" />
             Candidates
           </Button>
         </nav>
       </aside>
      <main className="flex-1 md:ml-72">
        <div className="p-6 md:pt-8 md:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center mb-6 md:mb-8 justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Candidate Management</h1>
              <p className="text-muted-foreground mt-1">
                View, track, and manage all candidates in your pipeline.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ModeToggle />
              <Button>
                <FilePlus2 className="mr-2 h-4 w-4" />
                Assign New Assessment
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Candidates</CardTitle>
                  <CardDescription>
                    A list of all candidates registered in the system.
                  </CardDescription>
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
                    {renderCandidateRows()}
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