// app/api/roadmap/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { auth as adminAuth, credential } from "firebase-admin";
import { initializeApp, getApps } from "firebase-admin/app";
import { saveRoadmap } from "@/lib/firestore";

// ✨ FINAL FIX: Initialize with Application Default Credentials
if (!getApps().length) {
  initializeApp({
    credential: credential.applicationDefault(),
  });
}

const roadmapStepSchema = z.object({
  title: z.string(),
  description: z.string(),
  resourceLink: z.string().url().nullable(),
});

const roadmapSectionSchema = z.object({
  sectionTitle: z.string(),
  steps: z.array(roadmapStepSchema),
});

const roadmapResponseSchema = z.object({
  roadmap: z.array(roadmapSectionSchema).min(3),
});

export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!authToken) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }
    const decodedToken = await adminAuth().verifyIdToken(authToken);
    const uid = decodedToken.uid;

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
      Your task is to generate a detailed, actionable roadmap. The response MUST be a JSON object structured as:
      {
        "roadmap": [
          {
            "sectionTitle": "Phase 1: Title",
            "steps": [
              {
                "title": "Specific step title",
                "description": "A 1-2 sentence explanation.",
                "resourceLink": "A relevant URL or null."
              }
            ]
          }
        ]
      }
      Strengths: ${strengths.join(", ")}
      Gaps: ${gaps.join(", ")}
    `;
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsedObject = JSON.parse(responseText);
    const validation = roadmapResponseSchema.safeParse(parsedObject);

    if (!validation.success) {
      throw new Error("AI model returned an object with an invalid shape.");
    }
    
    const roadmapData = validation.data;

    await saveRoadmap(uid, careerTitle, roadmapData);

    return NextResponse.json(roadmapData);

  } catch (error: any) {
    const errorMessage = error.message || "An unexpected error occurred.";
    if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
        return NextResponse.json({ error: "Authentication session has expired. Please log in again." }, { status: 401 });
    }
    console.error("Roadmap API Error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}