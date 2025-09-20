// app/analyze/page.tsx
'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation'; // Import the router
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoaderCircle, Sparkles, UploadCloud, Target, Check, AlertTriangle, Wand2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface OpportunityAnalysisResult {
  strengths: string[];
  gaps: string[];
  atsScore: number;
  suggestions: string[];
}

export default function AnalyzePage() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  // This state is kept to display results in case the redirect fails or for debugging
  const [analysis, setAnalysis] = useState<OpportunityAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter(); // Initialize the router

  const handleAnalyze = async () => {
    if (!resumeFile || !jobDescription.trim()) {
      setError("Please upload a resume and paste a job description.");
      return;
    }
    setIsLoading(true);
    setError('');
    setAnalysis(null);

    const formData = new FormData();
    formData.append('resumeFile', resumeFile);
    formData.append('jobDescriptionText', jobDescription);

    try {
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      setAnalysis(data); // You can still set the analysis data

      // --- SEAMLESS REDIRECTION ---
      // 1. Extract the necessary data for the next step.
      const { strengths, gaps } = data;

      // 2. Create a query string with the strengths and gaps.
      const query = new URLSearchParams({
          strengths: strengths.join(','),
          gaps: gaps.join(','),
      }).toString();

      // 3. Automatically redirect the user to the career paths page.
      router.push(`/career-paths?${query}`);
      // --- END OF REDIRECTION LOGIC ---

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please check the console.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <MainLayout>
      <div className="container py-12">
        <Card className="max-w-4xl mx-auto shadow-xl border">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Opportunity Gap Analysis</CardTitle>
            <CardDescription className="text-md">
              Upload your resume and paste a target job description to see how you stack up.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="space-y-2">
                  <label htmlFor="resume-upload" className="font-semibold flex items-center"><UploadCloud className="mr-2 h-5 w-5 text-primary"/> Step 1: Upload Your Resume (PDF)</label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors" onClick={handleFileSelect}>
                      <input id="resume-upload" type="file" ref={fileInputRef} onChange={(e) => setResumeFile(e.target.files ? e.target.files[0] : null)} className="hidden" accept=".pdf" />
                      {resumeFile ? <p className="font-semibold text-green-600">✅ {resumeFile.name}</p> : <p className="text-muted-foreground">Click to select a PDF file</p>}
                  </div>
              </div>
            <div className="space-y-2">
              <label htmlFor="job-description" className="font-semibold flex items-center"><Target className="mr-2 h-5 w-5 text-primary"/> Step 2: Paste Target Job Description</label>
              <Textarea id="job-description" placeholder="Paste the full job description here..." className="min-h-[200px] text-base shadow-inner" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-center">
            <Button onClick={handleAnalyze} disabled={isLoading || !resumeFile || !jobDescription.trim()} size="lg" className="w-full">
              {isLoading ? <LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
              Analyze My Fit
            </Button>
            {error && <p className="text-red-500 mt-4 text-center font-semibold">{error}</p>}
          </CardFooter>
        </Card>

        {/* This section will now only be visible if the redirect fails */}
        {analysis && (
            <Card className="max-w-4xl mx-auto mt-8 shadow-xl border">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center">Analysis Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center">
                        <p className="text-lg font-semibold text-muted-foreground">ATS Match Score</p>
                        <p className="text-7xl font-bold text-primary">{analysis.atsScore}%</p>
                        <p className="text-sm text-muted-foreground mt-2">This score estimates how well your resume matches the job description's keywords.</p>
                    </div>
                    <hr />
                    <div className="space-y-2">
                        <h3 className="font-semibold text-xl flex items-center text-green-600"><Check className="mr-2 h-6 w-6"/> Strengths</h3>
                        <ul className="list-disc pl-5 space-y-1">
                        {analysis.strengths.map((strength, index) => (
                            <li key={`strength-${index}`}>{strength}</li>
                        ))}
                        </ul>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold text-xl flex items-center text-orange-600"><AlertTriangle className="mr-2 h-6 w-6"/> Gaps to Address</h3>
                        <ul className="list-disc pl-5 space-y-1">
                        {analysis.gaps.map((gap, index) => (
                            <li key={`gap-${index}`}>{gap}</li>
                        ))}
                        </ul>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold text-xl flex items-center text-blue-600"><Wand2 className="mr-2 h-6 w-6"/> Actionable Suggestions</h3>
                        <ul className="list-disc pl-5 space-y-1">
                        {analysis.suggestions.map((suggestion, index) => (
                            <li key={`suggestion-${index}`}>{suggestion}</li>
                        ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>
        )}
      </div>
    </MainLayout>
  );
}