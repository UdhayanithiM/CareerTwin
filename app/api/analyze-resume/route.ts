// File: app/api/analyze-resume/route.ts

import { NextRequest, NextResponse } from "next/server";
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

// Define the exact JSON structure you expect from the AI model using a Zod schema.
// This ensures the response is type-safe and validated.
const resumeAnalysisSchema = z.object({
  skills: z.array(z.string()).length(3).describe("The user's top 3 most marketable skills."),
  careerPaths: z.array(z.object({
    title: z.string().describe("A specific, suitable career path title."),
    justification: z.string().describe("A concise, one-sentence justification for the career path recommendation.")
  })).length(3).describe("3 recommended career paths.")
});

export async function POST(req: NextRequest) {
  try {
    const { resumeText } = await req.json();
    if (!resumeText) {
      return new NextResponse("Resume text is required", { status: 400 });
    }

    const prompt = `You are "The Analyst," an expert career advisor for the CareerTwin platform.
    Analyze the following resume text meticulously.
    Your task is to identify the user's top 3 most marketable skills and recommend 3 specific, suitable career paths.
    For each career path, provide a concise, one-sentence justification explaining why it's a good fit based on the resume.
    
    Resume Text: "${resumeText}"`;

    // Use the modern 'generateObject' function for structured JSON output.
    const { object } = await generateObject({
      model: google('gemini-1.5-pro-latest'),
      schema: resumeAnalysisSchema,
      prompt: prompt,
    });

    return NextResponse.json(object);

  } catch (error) {
    console.error("Error in Analyst API:", error);
    // It's good practice to check the error type for more specific responses
    if (error instanceof Error) {
      return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}