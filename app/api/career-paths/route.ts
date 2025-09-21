// app/api/career-paths/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { auth as adminAuth, credential } from "firebase-admin";
import { initializeApp, getApps } from "firebase-admin/app";

// ✨ FINAL FIX: Initialize with Application Default Credentials
if (!getApps().length) {
  initializeApp({
    credential: credential.applicationDefault(),
  });
}

const careerPathSchema = z.object({
  title: z.string(),
  description: z.string(),
  matchScore: z.number().int().min(0).max(100),
  avgSalary: z.string(),
});

const careerPathsResponseSchema = z.object({
  careerPaths: z.array(careerPathSchema).min(3).max(5),
});

export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!authToken) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }
    await adminAuth().verifyIdToken(authToken);

    const { strengths, gaps } = await req.json();

    if (!strengths || !gaps) {
      return NextResponse.json({ error: "Strengths and gaps are required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `
      Based on the following resume analysis, generate 3-5 tailored career path recommendations for a student in India. Your response MUST be a JSON object that strictly adheres to this structure:
      {
        "careerPaths": [
          {
            "title": "The job title (e.g., 'Data Scientist')",
            "description": "A brief, compelling 1-2 sentence description of why this is a good fit.",
            "matchScore": "An integer between 0 and 100 indicating how well the user's strengths align with this career.",
            "avgSalary": "A realistic average salary range for this role in India (e.g., '₹8,00,000 - ₹15,00,000')."
          }
        ]
      }
      Resume Analysis:
      ---
      Strengths: ${strengths.join(", ")}
      Gaps to address: ${gaps.join(", ")}
      ---
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsedObject = JSON.parse(responseText);
    const validation = careerPathsResponseSchema.safeParse(parsedObject);

    if (!validation.success) {
      throw new Error("AI model returned an object with an invalid shape.");
    }

    return NextResponse.json(validation.data);

  } catch (error: any) {
    const errorMessage = error.message || "An unexpected error occurred.";
    if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
        return NextResponse.json({ error: "Authentication session has expired. Please log in again." }, { status: 401 });
    }
    console.error("Career Paths API Error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}