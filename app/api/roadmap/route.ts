// app/api/roadmap/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

// Zod schemas for a structured, multi-step roadmap
const roadmapStepSchema = z.object({
  title: z.string(),
  description: z.string(),
  // ✨ FIX: Changed from .optional() to .nullable()
  // This allows the AI to return `null` for the resourceLink, making our validation robust.
  resourceLink: z.string().url().nullable(),
});

const roadmapSectionSchema = z.object({
  sectionTitle: z.string(), // e.g., "Phase 1: Foundational Skills"
  steps: z.array(roadmapStepSchema),
});

const roadmapResponseSchema = z.object({
  roadmap: z.array(roadmapSectionSchema).min(3),
});

export async function POST(req: NextRequest) {
  try {
    const { careerTitle, strengths, gaps } = await req.json();

    if (!careerTitle || !strengths || !gaps) {
      return NextResponse.json({ error: "Career title, strengths, and gaps are required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not defined");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
      You are an expert AI Career Strategist. A student in India has the following strengths and gaps and wants to pursue a career as a "${careerTitle}".

      Strengths: ${strengths.join(", ")}
      Gaps: ${gaps.join(", ")}

      Your task is to generate a detailed, actionable, and personalized step-by-step roadmap for them. The roadmap should be broken down into at least 3 logical phases (e.g., Foundations, Building Experience, Job Readiness). Your response MUST be a JSON object that strictly adheres to this structure:

      {
        "roadmap": [
          {
            "sectionTitle": "Phase 1: Title for the first phase",
            "steps": [
              {
                "title": "Specific, actionable step title (e.g., 'Master Python Fundamentals')",
                "description": "A 1-2 sentence explanation of why this step is important and what to focus on.",
                "resourceLink": "A URL to a relevant high-quality course or tutorial. If no suitable link is found, this value MUST be null."
              }
            ]
          }
        ]
      }

      Generate a comprehensive and encouraging roadmap. Prioritize free or highly-rated resources where possible.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsedObject = JSON.parse(responseText);
    const validation = roadmapResponseSchema.safeParse(parsedObject);

    if (!validation.success) {
      console.error("Zod validation failed. AI Response:", parsedObject);
      // Log the specific Zod errors for easier debugging
      console.error("Validation Errors:", validation.error.flatten()); 
      throw new Error("AI model returned an object with an invalid shape.");
    }

    return NextResponse.json(validation.data);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("Roadmap API Error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}