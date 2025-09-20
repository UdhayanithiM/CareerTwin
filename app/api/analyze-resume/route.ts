// app/api/analyze-resume/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import pdf from 'pdf-parse';

// This forces the use of the Node.js runtime, which is correct.
export const runtime = 'nodejs';

const opportunityAnalysisSchema = z.object({
    strengths: z.array(z.string()).min(3).max(5).describe("List of 3-5 key skills from the resume that match the job description."),
    gaps: z.array(z.string()).min(3).max(5).describe("List of 3-5 crucial skills from the job description missing from the resume."),
    atsScore: z.number().int().min(0).max(100).describe("An ATS match score from 0 to 100."),
    suggestions: z.array(z.string()).length(2).describe("Exactly 2 actionable suggestions for the user.")
});

export async function POST(req: NextRequest) {
    try {
        // --- THIS IS THE FIX ---
        // Initialize the Google AI client here, inside the function.
        // This guarantees that environment variables are loaded before being accessed.
        const google = createGoogleGenerativeAI({
            apiKey: process.env.GOOGLE_API_KEY,
        });
        // --- END OF FIX ---

        const formData = await req.formData();
        const resumeFile = formData.get('resumeFile') as File | null;
        const jobDescriptionText = formData.get('jobDescriptionText') as string | null;

        if (!resumeFile || !jobDescriptionText) {
            return NextResponse.json({ error: "Resume file and Job Description are required" }, { status: 400 });
        }

        const fileBuffer = Buffer.from(await resumeFile.arrayBuffer());
        const pdfData = await pdf(fileBuffer);
        const resumeText = pdfData.text;

        if (!resumeText) {
            return NextResponse.json({ error: "Could not extract text from PDF." }, { status: 400 });
        }

        const prompt = `Perform an "Opportunity Gap Analysis". Compare the resume against the job description. Identify strengths, gaps, calculate an ATS score, and provide two actionable suggestions. Resume Text: "${resumeText}". Job Description Text: "${jobDescriptionText}"`;

        const { object } = await generateObject({
            model: google('gemini-1.5-pro-latest'),
            schema: opportunityAnalysisSchema,
            prompt: prompt,
        });

        return NextResponse.json(object);
    } catch (error) {
        console.error("Error in Analysis API:", error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
        // Provide a more specific error message if the API key is missing
        if (errorMessage.includes('API key')) {
             return NextResponse.json({ error: "Server is missing Google API Key." }, { status: 500 });
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}